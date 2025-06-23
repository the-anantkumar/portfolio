# Agents Overview

This document lists the main components and API routes in this project, along with their purpose, inputs and outputs, dependencies, and example usage.

## Hero Component
**Purpose**: Displays the landing section with a brief introduction and a call-to-action link.

**Inputs/Outputs**: Accepts no props and returns a React element.

**Dependencies**: Uses `next/link` for client-side navigation.

**Example Usage**:
```tsx
import Hero from '../components/Hero'

<Hero />
```

## Navbar Component
**Purpose**: Provides the site navigation links at the top of the page.

**Inputs/Outputs**: Accepts no props and returns a React element.

**Dependencies**: Uses `next/link` for navigation between sections.

**Example Usage**:
```tsx
import Navbar from '../components/Navbar'

<Navbar />
```

## Layout Component
**Purpose**: Wraps pages with a consistent layout containing the `Navbar` and `Footer`.

**Inputs/Outputs**: Receives `children` (React nodes) and returns a React element.

**Dependencies**: Imports `Navbar` and `Footer` components from the project.

**Example Usage**:
```tsx
import Layout from '../components/Layout'

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
```

## ProjectCard Component
**Purpose**: Shows information about a project including image, description, and optional link.

**Inputs/Outputs**:
- `title` – string
- `description` – string
- `imageSrc` – string path to an image
- `link?` – optional string URL

Returns a React element.

**Dependencies**: Uses `next/image` for optimized images.

**Example Usage**:
```tsx
import ProjectCard from '../components/ProjectCard'

<ProjectCard
  title="My Project"
  description="Short summary"
  imageSrc="/images/project.png"
  link="https://example.com"
/>
```

## TimelineItem Component
**Purpose**: Displays an item within a timeline such as work experience or education.

**Inputs/Outputs**:
- `title` – string
- `subtitle?` – optional string
- `date` – string displayed as the timeline date
- `children?` – optional React nodes shown below the title

Returns a React element.

**Dependencies**: None besides React typings.

**Example Usage**:
```tsx
import TimelineItem from '../components/TimelineItem'

<TimelineItem title="Job" subtitle="Role" date="2024">
  Description of duties
</TimelineItem>
```

## API Routes

### `/api/hello`
**Purpose**: Example endpoint returning a simple JSON object.

**Inputs/Outputs**: Accepts an HTTP request and responds with `{ name: 'John Doe' }`.

**Dependencies**: None.

**Example Usage**:
```bash
curl /api/hello
```

### `/api/contact`
**Purpose**: Handles contact form submissions and sends an email via Nodemailer.

**Inputs/Outputs**: Expects a POST request with `name`, `email`, and `message` fields. Returns `{ success: true }` on success or an error message.

**Dependencies**:
- `nodemailer` for sending email
- Environment variables `CONTACT_EMAIL_USER` and `CONTACT_EMAIL_PASS`

**Example Usage**:
```bash
curl -X POST /api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","message":"Hi"}'
```
