# Smart Work Assistant

BUILD A RESPONSIVE AI WORKPLACE PRODUCTIVITY ASSISTANT

Build a complete, polished, responsive web application called:

AI Workplace Productivity Assistant

This is an academic project and must demonstrate strong functionality, usability, prompt engineering, innovation, responsible AI practices, responsive design, and professional UI/UX.

The application should feel like a real SaaS productivity product rather than a static student prototype.

The most important priorities are:

1. Functionality
2. Simplicity
3. Easy navigation
4. Responsive design
5. Readability and accessibility
6. Professional UI/UX
7. Strong AI prompt engineering
8. Responsible AI

Do not overcomplicate the application.

PRODUCT PURPOSE

Create one AI-powered workplace productivity platform that helps professionals complete common workplace tasks more efficiently.

The platform should provide these five tools:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner / Scheduler

AI Research Assistant

AI Workplace Chatbot

The main user experience should be:

Choose a tool → Enter information → Generate AI result → Review/edit → Copy/save/use result

Keep this flow obvious throughout the application.

DESIGN SYSTEM

Create a clean, modern and professional SaaS-style interface.

The design should feel:

Intelligent

Trustworthy

Professional

Simple

Modern

Easy to use

COLOUR REQUIREMENTS

Use a coordinated colour palette.

Accessibility and readability are extremely important.

DO NOT:

Use light grey text on white backgrounds.

Use dark text on dark backgrounds.

Use colours that make buttons difficult to read.

Use too many bright colours.

Use colour combinations with poor contrast.

Use colour as the only way to communicate status.

DO:

Use dark, highly readable primary text.

Use strong contrast between text and backgrounds.

Use one primary accent colour consistently.

Use a small number of complementary colours.

Ensure buttons have readable text.

Ensure form labels and inputs are clearly visible.

Ensure alerts and status messages are distinguishable.

Maintain consistent colours throughout the entire application.

The UI should be visually attractive without sacrificing readability.

RESPONSIVE DESIGN

The website MUST work properly on:

Desktop

Laptop

Tablet

Mobile

Do not simply shrink the desktop version.

Adapt layouts appropriately for smaller screens.

On mobile:

Sidebar becomes a hamburger/mobile navigation.

Cards stack vertically.

Forms become single-column where necessary.

Tables become responsive.

Buttons remain easy to tap.

Text never overflows.

AI-generated content remains readable.

Navigation remains simple.

The application should be tested conceptually at:

1440px

1024px

768px

390px

APPLICATION ROUTES

Create:

/dashboard

/email-generator

/meeting-summarizer

/task-planner

/research-assistant

/ai-chat

/settings

Use a consistent application layout.

NAVIGATION

Create a persistent sidebar on desktop.

Sidebar should include:

Application logo/name

Dashboard

Email Generator

Meeting Summarizer

Task Planner

Research Assistant

AI Assistant

Settings

Use appropriate icons.

Clearly show the currently active page.

On mobile, convert the sidebar into an accessible mobile navigation menu.

Navigation must work correctly.

DASHBOARD

Create a polished dashboard homepage.

Display:

AI Workplace Productivity Assistant

Subtitle:

Work smarter. Write faster. Organize better.

Add a short explanation of the platform.

Create five main feature cards.

Smart Email Generator

Generate professional workplace emails quickly.

Button:

Create Email

Meeting Notes Summarizer

Turn lengthy meeting notes into useful summaries and action items.

Button:

Summarize Notes

AI Task Planner

Create intelligent daily and weekly schedules based on priorities and deadlines.

Button:

Plan My Tasks

AI Research Assistant

Research topics, summarize information and generate useful insights.

Button:

Start Research

AI Workplace Assistant

Chat with an AI assistant for workplace productivity and problem-solving.

Button:

Open Assistant

Also include a simple Recent Activity section.

Examples:

Email generated

Meeting summarized

Schedule created

Research completed

SMART EMAIL GENERATOR

Create an easy-to-use form.

Inputs:

Recipient / Audience

Subject

Purpose of Email

Important Details

Tone

Tone options:

Formal

Friendly

Persuasive

Professional

Apologetic

Concise

Additional options:

Email Length

Language

Call-to-action

Primary action:

Generate Email

OUTPUT

Display:

Subject

Email Body

The email body must be editable.

Actions:

Copy

Edit

Regenerate

Clear

AI PROMPT ENGINEERING

The underlying prompt should instruct the AI to:

Understand the user's purpose.

Preserve user-provided facts.

Match the requested tone.

Write naturally and professionally.

Avoid unnecessary filler.

Avoid fabricated information.

Never invent dates, people, deadlines, commitments or facts.

Ask for clarification when essential information is missing.

Produce a clear workplace-ready email.

MEETING NOTES SUMMARIZER

Create a large text area where users can paste meeting notes.

Optional fields:

Meeting Title

Participants

Date

Primary button:

Summarize Meeting

Output must contain:

Meeting Summary

Key Decisions

Action Items

Use a clear table:

| Task | Owner | Deadline |

Important Points

The AI must NOT invent:

Owners

Deadlines

Decisions

Commitments

When information is unavailable, display:

Not specified

Actions:

Copy

Edit

Regenerate

Clear

AI TASK PLANNER / SCHEDULER

Create a task planning interface.

Allow users to add multiple tasks.

Each task should support:

Task name

Due date

Priority

Estimated duration

Notes

Priority options:

High

Medium

Low

Allow users to select:

Daily Plan

Weekly Plan

Primary button:

Generate Schedule

The AI should consider:

Priority

Deadlines

Available working hours

Estimated effort

Dependencies where provided

Do not generate unrealistic schedules.

Do not schedule more work than the user has available time for.

OUTPUT

Display a clear schedule.

Example:

Monday

09:00 – 10:00
Complete project proposal

10:15 – 11:00
Respond to client emails

11:15 – 12:00
Research presentation topic

Include:

Priority indicators

Completion checkboxes

Edit

Delete

Regenerate

AI RESEARCH ASSISTANT

Create a research interface.

Main input:

What would you like to research?

Controls:

Research Depth

Quick

Standard

Detailed

Output Format

Summary

Key Points

Report

Pros and Cons

Recommendations

Output structure:

Overview

Key Findings

Important Considerations

Insights

Recommendations

Sources / References

IMPORTANT:

Do not falsely claim that live internet research was performed when no external research API is connected.

If the application is using simulated/mock research, clearly communicate that the results are AI-generated and should be verified.

Example:

AI-generated research summary. Verify important information using reliable sources.

AI WORKPLACE CHATBOT

Create a modern chatbot interface.

The chatbot should behave as a workplace productivity assistant.

It should help users with:

Email writing

Rewriting professional communication

Task prioritization

Meeting preparation

Brainstorming

Summarization

Productivity planning

Workplace-related questions

Include:

Chat history

User messages

AI responses

Text input

Send button

Clear conversation

Add suggested prompts such as:

Help me prepare for tomorrow's meeting.

Rewrite this email professionally.

Help me prioritize these tasks.

Create a weekly productivity plan.

AI OUTPUT EXPERIENCE

Never display AI results as one huge block of text.

Structure long responses with:

Headings

Paragraphs

Bullet points

Tables when appropriate

Highlighted important information

Every major AI output should provide:

Copy

Edit

Regenerate

Add appropriate loading states while AI content is being generated.

RESPONSIBLE AI

Include a visible Responsible AI Notice within the application.

Use wording similar to:

Responsible AI Notice

“AI-generated content may contain errors or inaccuracies. Review important information before using it in professional, legal, financial, medical or other high-impact situations. Avoid entering confidential or sensitive information unless appropriate.”

The application should demonstrate:

Human oversight

Transparency

Privacy awareness

Verification

Avoidance of fabricated information

Do not claim that AI-generated information is always accurate.

ERROR HANDLING

Every major interaction should have appropriate states.

Include:

Loading State

Example:

Generating your response...

Error State

Example:

Something went wrong. Please try again.

Validation State

Example:

Please enter the purpose of the email before generating it.

Empty State

Clearly explain what the user should do before using the tool.

Never expose raw technical errors to the user.

USER EXPERIENCE

The application must be extremely intuitive.

Each page should immediately communicate:

What is this tool?

What information should I enter?

What action should I take?

Where will my result appear?

Use clear labels.

Do not rely only on placeholder text.

Provide feedback after important actions.

FUNCTIONAL REQUIREMENTS

This must be a functional application.

Do NOT create dead buttons or fake interactions.

Ensure:

Navigation works.

Forms work.

Inputs work.

Buttons work.

AI responses appear correctly.

Generated content can be edited.

Generated content can be copied.

Tasks can be added.

Tasks can be deleted.

Tasks can be marked complete.

Chat messages work.

Mobile navigation works.

Clear/reset functions work.

Where a real AI API is not connected, create a clean AI service abstraction/mock implementation.

Structure the application so a real AI API can be added later without rebuilding the entire UI.

STATE AND DATA

Use sensible state management.

Where appropriate, persist non-sensitive information such as:

Recent activity

Tasks

Chat history

Generated content

Do not unnecessarily store sensitive information.

ACCESSIBILITY

Build accessibility into the application.

Include:

Strong colour contrast

Keyboard-friendly navigation

Visible focus states

Correct form labels

Accessible buttons

Semantic structure

Responsive typography

Status indicators that do not depend on colour alone

VISUAL POLISH

Maintain consistency across every page.

Pay attention to:

Typography hierarchy

Spacing

Alignment

Buttons

Cards

Icons

Borders

Border radius

Shadows

Hover states

Loading states

Error states

Empty states

Success states

Avoid excessive:

Gradients

Animations

Colours

Decorative elements

Huge headings

Tiny text

Crowded layouts

Animations should be subtle and purposeful.

COMPONENT ARCHITECTURE

Create reusable components where appropriate.

Examples:

Sidebar

Mobile Navigation

Header

Button

Input

Select

Card

AI Output Panel

Loading State

Error Message

Success Message

Modal

Keep business logic separate from presentation where practical.

Use clean naming conventions and maintainable code.

GITHUB README REQUIREMENT

IMPORTANT:

The README.md is for the GitHub repository, not a visible feature inside the web application.

Create a professional README.md file at the root of the project.

The README must include:

1. Project Title

AI Workplace Productivity Assistant

2. Project Overview

Explain what the application is, the problem it solves, and its purpose.

3. Features

Document the implemented features:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

AI Research Assistant

AI Workplace Chatbot

4. Technologies Used

List the actual technologies, frameworks, libraries and APIs used in the project.

Do not list technologies that were not actually used.

5. Project Structure

Briefly explain the main folders and important files.

6. Installation / Setup

Provide accurate instructions for:

Cloning the repository

Installing dependencies

Configuring environment variables if required

Running the application locally

7. Usage

Explain how to use the major features.

8. AI Prompt Engineering

Explain how structured prompts are used to guide AI responses, improve consistency and reduce hallucinations.

9. Responsible AI

Explain the application's responsible AI practices.

10. Limitations

Clearly state limitations such as mock AI responses or unavailable APIs where applicable.

11. Future Improvements

Include realistic improvements that could be added later.

12. Team Members

Add a section for project team members.

Do not place README content inside the application UI.

GITHUB PROJECT NAME

The repository should be clearly named:

AI-Workplace-Productivity-Assistant

Keep naming consistent across the project.

FINAL TESTING AND QUALITY CHECK

Before considering the application complete, inspect the entire project.

Test these complete workflows:

Workflow 1

Dashboard → Email Generator → Enter information → Generate → Edit → Copy

Workflow 2

Dashboard → Meeting Summarizer → Enter notes → Generate → Review output

Workflow 3

Dashboard → Task Planner → Add tasks → Generate schedule → Edit → Complete task

Workflow 4

Dashboard → Research Assistant → Enter topic → Generate result → Review

Workflow 5

Dashboard → AI Assistant → Send message → Receive response → Continue conversation

Workflow 6

Open the application on mobile → Open navigation → Navigate between tools → Use a feature

Fix:

Broken links

Broken buttons

Layout problems

Responsiveness issues

Console errors

Overflow issues

Poor colour contrast

Missing states

Inconsistent spacing

Unclear labels

Do not stop at creating attractive screens.

The final application must be usable, functional, responsive and presentation-ready.

The end result should look like a product that could confidently be demonstrated to a lecturer, recruiter, client or employer.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fc619d98-fcee-4471-a21e-3c1b4f9ac18c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
