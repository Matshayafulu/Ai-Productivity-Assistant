import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import {
  Alert,
  Button,
  Card,
  Field,
  LoadingState,
  PageHeader,
  PriorityBadge,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui-kit";
import { useAiTask } from "@/lib/useAiTask";
import { parseJsonLoose } from "@/lib/prompts";
import { logActivity, usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Add tasks with priorities, deadlines and durations, then generate a realistic daily or weekly schedule you can edit and tick off.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Realistic daily and weekly schedules built around your priorities.",
      },
    ],
  }),
  component: TaskPlanner,
});

type Task = {
  id: string;
  name: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  duration: string;
  notes: string;
};

type Block = {
  id: string;
  start: string;
  end: string;
  task: string;
  priority: string;
  note?: string;
  done: boolean;
};

type Day = { day: string; blocks: Block[] };

type Schedule = { days: Day[]; unscheduled: string[]; notes: string[] };

type RawSchedule = {
  days?: Array<{
    day?: string;
    blocks?: Array<{
      start?: string;
      end?: string;
      task?: string;
      priority?: string;
      note?: string;
    }>;
  }>;
  unscheduled?: string[];
  notes?: string[];
};

const NEW_TASK: Omit<Task, "id"> = {
  name: "",
  due: "",
  priority: "Medium",
  duration: "1 hour",
  notes: "",
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function TaskPlanner() {
  const [tasks, setTasks] = usePersistentState<Task[]>("planner:tasks", []);
  const [schedule, setSchedule] = usePersistentState<Schedule | null>(
    "planner:schedule",
    null,
  );
  const [draft, setDraft] = useState(NEW_TASK);
  const [mode, setMode] = useState("Daily Plan");
  const [hours, setHours] = useState("6");
  const [startTime, setStartTime] = useState("09:00");
  const [validation, setValidation] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const { generate, loading, error } = useAiTask("planner");

  const addTask = () => {
    if (!draft.name.trim()) {
      setValidation("Please enter a task name before adding it.");
      return;
    }
    setValidation(null);
    setTasks([...tasks, { ...draft, id: uid() }]);
    setDraft(NEW_TASK);
  };

  const removeTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const buildSchedule = async () => {
    if (tasks.length === 0) {
      setValidation("Please add at least one task before generating a schedule.");
      return;
    }
    setValidation(null);
    const taskLines = tasks
      .map(
        (t) =>
          `- ${t.name} | due: ${t.due || "Not specified"} | priority: ${t.priority} | estimated duration: ${t.duration || "Not specified"} | notes: ${t.notes || "None"}`,
      )
      .join("\n");

    const text = await generate({
      fields: { mode, hours, startTime, tasks: taskLines },
    });
    if (!text) return;

    const raw = parseJsonLoose<RawSchedule>(text);
    if (!raw?.days) {
      setSchedule({
        days: [],
        unscheduled: [],
        notes: ["The schedule could not be formatted. Please try Regenerate."],
      });
      return;
    }

    setSchedule({
      days: raw.days.map((d) => ({
        day: d.day ?? "Day",
        blocks: (d.blocks ?? []).map((b) => ({
          id: uid(),
          start: b.start ?? "",
          end: b.end ?? "",
          task: b.task ?? "Not specified",
          priority: b.priority ?? "Medium",
          note: b.note,
          done: false,
        })),
      })),
      unscheduled: raw.unscheduled ?? [],
      notes: raw.notes ?? [],
    });
    logActivity("planner", "Schedule created", `${mode} · ${tasks.length} tasks`);
  };

  const updateBlock = (dayIndex: number, blockId: string, patch: Partial<Block>) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      days: schedule.days.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              blocks: day.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
            },
      ),
    });
  };

  const deleteBlock = (dayIndex: number, blockId: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      days: schedule.days.map((day, i) =>
        i !== dayIndex ? day : { ...day, blocks: day.blocks.filter((b) => b.id !== blockId) },
      ),
    });
  };

  return (
    <AppLayout breadcrumb="Task Planner">
      <PageHeader
        title="AI Task Planner"
        subtitle="Add what you need to do, set your available hours, and get a realistic schedule ordered by priority and deadline."
        help="The planner never books more work than the hours you say you have. Anything that does not fit is listed separately."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-base font-semibold text-foreground">Add a task</h2>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                addTask();
              }}
            >
              <Field label="Task name" required>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. Complete project proposal"
                  />
                )}
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Due date">
                  {(id) => (
                    <TextInput
                      id={id}
                      type="date"
                      value={draft.due}
                      onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                    />
                  )}
                </Field>
                <Field label="Priority">
                  {(id) => (
                    <Select
                      id={id}
                      value={draft.priority}
                      onChange={(e) =>
                        setDraft({ ...draft, priority: e.target.value as Task["priority"] })
                      }
                    >
                      {["High", "Medium", "Low"].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>

              <Field label="Estimated duration">
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.duration}
                    onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                    placeholder="e.g. 90 minutes"
                  />
                )}
              </Field>

              <Field label="Notes" hint="Dependencies or context (optional)">
                {(id) => (
                  <TextArea
                    id={id}
                    rows={2}
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    placeholder="e.g. Needs input from finance first"
                  />
                )}
              </Field>

              <Button type="submit" variant="secondary">
                <Plus className="size-4" aria-hidden="true" />
                Add task
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-foreground">Plan settings</h2>
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Plan type">
                {(id) => (
                  <Select id={id} value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option>Daily Plan</option>
                    <option>Weekly Plan</option>
                  </Select>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Hours per day">
                  {(id) => (
                    <TextInput
                      id={id}
                      type="number"
                      min={1}
                      max={12}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Day starts at">
                  {(id) => (
                    <TextInput
                      id={id}
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  )}
                </Field>
              </div>

              {validation ? <Alert tone="warning" title={validation} /> : null}

              <Button onClick={() => void buildSchedule()} disabled={loading}>
                <Sparkles className="size-4" aria-hidden="true" />
                {loading ? "Building schedule…" : "Generate Schedule"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Your tasks ({tasks.length})
              </h2>
              {tasks.length > 0 ? (
                <Button size="sm" variant="secondary" onClick={() => setTasks([])}>
                  Clear all
                </Button>
              ) : null}
            </div>

            {tasks.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                No tasks yet. Add your first task on the left — include a priority and an
                estimated duration for the best schedule.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{task.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Due {task.due || "Not specified"} · {task.duration || "Not specified"}
                        {task.notes ? ` · ${task.notes}` : ""}
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                    <button
                      onClick={() => removeTask(task.id)}
                      aria-label={`Delete task ${task.name}`}
                      className="rounded-md border border-border bg-card p-1.5 text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <section aria-label="Generated schedule" className="glass-panel rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">Schedule</h2>
              {schedule ? (
                <div className="ml-auto flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing((v) => !v)}
                    aria-pressed={editing}
                  >
                    {editing ? "Done" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void buildSchedule()}
                    disabled={loading}
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Regenerate
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setSchedule(null)}>
                    Clear
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              {loading ? <LoadingState label="Building your schedule…" /> : null}
              {!loading && error ? (
                <Alert tone="error" title="Something went wrong. Please try again.">
                  {error}
                </Alert>
              ) : null}

              {!loading && !error && !schedule ? (
                <div className="rounded-xl border border-dashed border-input bg-card/60 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Your schedule will appear here
                  </p>
                  <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                    Add your tasks, choose a daily or weekly plan, then select Generate
                    Schedule.
                  </p>
                </div>
              ) : null}

              {!loading && schedule ? (
                <div className="flex flex-col gap-5">
                  {schedule.days.map((day, dayIndex) => (
                    <div key={`${day.day}-${dayIndex}`}>
                      <h3 className="text-sm font-semibold text-foreground">{day.day}</h3>
                      <ul className="mt-2 flex flex-col gap-2">
                        {day.blocks.map((block) => (
                          <li
                            key={block.id}
                            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center"
                          >
                            <label className="flex items-start gap-3 sm:flex-1">
                              <input
                                type="checkbox"
                                checked={block.done}
                                onChange={(e) =>
                                  updateBlock(dayIndex, block.id, { done: e.target.checked })
                                }
                                className="mt-1 size-4 accent-[var(--primary)]"
                              />
                              <span className="min-w-0">
                                <span className="block text-xs font-medium text-muted-foreground">
                                  {block.start} – {block.end}
                                  {block.done ? " · Completed" : ""}
                                </span>
                                {editing ? (
                                  <input
                                    value={block.task}
                                    onChange={(e) =>
                                      updateBlock(dayIndex, block.id, { task: e.target.value })
                                    }
                                    aria-label="Edit scheduled task"
                                    className="mt-1 w-full rounded-md border border-input bg-card px-2 py-1 text-sm text-foreground"
                                  />
                                ) : (
                                  <span
                                    className={
                                      block.done
                                        ? "block text-sm text-muted-foreground line-through"
                                        : "block text-sm font-medium text-foreground"
                                    }
                                  >
                                    {block.task}
                                  </span>
                                )}
                                {block.note ? (
                                  <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {block.note}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                            <div className="flex items-center gap-2 sm:ml-auto">
                              <PriorityBadge priority={block.priority} />
                              <button
                                onClick={() => deleteBlock(dayIndex, block.id)}
                                aria-label={`Delete scheduled block ${block.task}`}
                                className="rounded-md border border-border bg-card p-1.5 text-destructive"
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {schedule.unscheduled.length > 0 ? (
                    <div className="rounded-xl border border-warning/40 bg-card p-3">
                      <p className="text-sm font-semibold text-warning">
                        Did not fit in the available time
                      </p>
                      <ul className="mt-1.5 list-disc pl-5 text-sm text-muted-foreground">
                        {schedule.unscheduled.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {schedule.notes.length > 0 ? (
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-sm font-semibold text-foreground">Planning notes</p>
                      <ul className="mt-1.5 list-disc pl-5 text-sm text-muted-foreground">
                        {schedule.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
