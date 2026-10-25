# Tamil AI Kadhai

Build a production-ready AI-powered Tamil Internet Radio / AI FM web app.

App name: Tamil AI Vanoli

Goal: Create an AI-powered radio platform that automatically generates and plays Tamil RJ-style shows using real news, public updates, cinema topics, local city updates, user questions, and AI-generated comedy conversations.

IMPORTANT LEGAL RULES:

- Do not copy Suryan FM, Chinna Thambi Periya Thambi, Degree Kaapi, or any existing radio show names, voices, scripts, jingles, or brand style.

- Create original AI show formats inspired by general radio concepts only.

- Do not store or republish full copyrighted news articles.

- Store only source title, short summary, URL, published date, source name, category, and AI-generated original script.

- Always show source links for news-based segments.

- Add a clear label: “AI-generated radio content based on public sources and verified inputs.”

- Add admin approval before publishing political, crime, religion, caste, finance, health, legal, or emergency-related content.

CORE MODULES:

1. Listener App

Create a premium responsive web app with:

- Live AI Radio player

- Show schedule

- Now playing card

- AI RJ profile

- Category channels:

  - Morning News Comedy

  - Two-Character Comedy Talk

  - Cinema Talk

  - Local City Updates

  - Motivation

  - Night Stories

  - Kids Stories

- City selector: Chennai, Salem, Coimbatore, Madurai, Trichy, Tiruppur

- Language selector: Tamil first, later English/Hindi

- User can submit topic/request/question

- User can like, share, save, and replay segments

- Display news source links below each factual segment

2. Admin Dashboard

Create admin dashboard with:

- News source management

- RSS/API source configuration

- Manual news input

- Show creation

- AI script generation

- AI voice generation status

- Audio episode library

- Approval workflow

- Content moderation queue

- Schedule calendar

- Analytics:

  - listeners

  - play count

  - completion rate

  - popular city

  - popular show

  - user requests

  - flagged content

3. News Source Engine

Create backend tables and logic for:

- sources

- news_items

- generated_scripts

- shows

- episodes

- voices

- schedules

- user_requests

- moderation_flags

News source types:

- RSS

- API

- Manual Entry

Default source examples:

- PIB RSS

- NewsOnAir / AIR news

- India.gov.in PIB news

- NDMA/SACHET public alerts

- NewsAPI configurable

- GDELT configurable

For MVP, if external API keys are not available, create a mock fetch system with sample data and make it easy to replace with real API later.

4. AI Script Generator

Create a script generation system with these show formats:

SHOW A: “Kaapi Kadhai”

Morning current affairs + fun Tamil talk.

Structure:

- Opening jingle line

- Good morning greeting

- 3 important headlines

- One local update

- One light comedy observation

- One useful fact

- One motivational closing

- Song intro placeholder

SHOW B: “Rendu Peru Radio”

Two-character comedy conversation.

Characters:

- Kutty: curious, innocent, funny, asks relatable questions

- Periya: witty, mature, sarcastic but respectful, explains the topic

Structure:

- Topic intro

- Back-and-forth comedy conversation

- Factual explanation

- Local Tamil slang

- Clean humor

- No insults, caste, religion, politics attack, body shaming, or adult content

- End with punchline and source mention

SHOW C: “Cinema Sandhai”

Cinema news and entertainment talk.

Structure:

- Trending movie update

- Actor/industry update

- Audience question

- Fun poll

- Song intro placeholder

SHOW D: “Ooru Update”

City-based local updates.

Structure:

- City greeting

- Weather/public alert if available

- Local event

- Traffic/travel note

- Business/shop/community spotlight

- Closing line

5. AI Prompt Template

Use this internal AI prompt when generating every script:

“You are an original Tamil AI radio scriptwriter. Create a fresh Tamil RJ script based only on the provided source summaries and approved admin notes. Do not copy the source wording. Do not invent facts. If a fact is uncertain, say it is unconfirmed or skip it. Keep the tone natural, local, funny, and radio-friendly. Use conversational Tamil. For serious news, stay respectful and neutral. For comedy, use clean humor only. Include source attribution at the end of factual segments. Output in this format:

- show_title

- episode_title

- language

- city

- duration_estimate

- characters

- script_lines with speaker names

- source_references

- moderation_notes

- voice_direction”

6. Voice and Audio

Add placeholders for integrating:

- ElevenLabs

- PlayHT

- Azure TTS

- Google Cloud TTS

- OpenAI TTS

Features:

- Select voice per AI RJ character

- Voice speed, pitch, emotion

- Background music bed

- Intro/outro jingle upload

- Sound effects for comedy

- Export episode as MP3

- Stream episode in web player

7. Scheduling

Create schedule system:

- Daily morning show at 7 AM

- Comedy show at 10 AM

- Cinema show at 5 PM

- Night story at 9 PM

- Admin can edit schedule

- Auto-generate draft episode before publishing

- Admin approval required before going live

8. Safety and Moderation

Add moderation rules:

- No defamatory content

- No fake news

- No political bias

- No hate speech

- No caste/religion jokes

- No copied copyrighted article text

- No medical/legal/financial advice without disclaimer

- Emergency alerts must be factual and sourced

- Serious news should not be turned into comedy

9. UI Design

Design should feel like a premium Tamil audio startup:

- Dark modern radio dashboard

- Warm Tamil cultural accent colors

- Big live player

- Animated audio waveform

- RJ character cards

- Show cards with cinematic thumbnails

- Mobile-first design

- Android WebView ready

- Smooth transitions

- Premium non-generic UI

10. Database Schema

Create tables:

sources:

- id

- name

- type

- url

- category

- language

- city

- is_active

news_items:

- id

- source_id

- title

- summary

- url

- category

- city

- published_at

- fetched_at

- credibility_score

- duplicate_group_id

shows:

- id

- name

- format_type

- description

- language

- city

- default_duration

- is_active

episodes:

- id

- show_id

- title

- script

- audio_url

- status: draft, pending_review, approved, published, rejected

- scheduled_at

- published_at

- source_links

- moderation_notes

voices:

- id

- character_name

- provider

- voice_id

- language

- tone

- speed

- pitch

user_requests:

- id

- user_name

- city

- request_text

- status

- created_at

moderation_flags:

- id

- episode_id

- flag_type

- severity

- reason

- resolved

11. MVP Requirements

Build the first working MVP with:

- Listener homepage

- Live player UI

- Show cards

- Admin dashboard

- Add news manually

- Generate AI script button

- Review and approve script

- Publish episode

- Mock audio player

- Source references shown below episode

- Mobile responsive layout

12. Future-ready Requirements

Keep architecture ready for:

- Real RSS fetching

- NewsAPI integration

- GDELT integration

- TTS voice generation

- MP3 rendering

- Android WebView app

- Push notifications

- Subscription/sponsor ads

- City-based AI radio channels

Create the full app with clean code, reusable components, secure environment variable handling, and beautiful production-grade UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d76d9f66-ac84-4e35-9ec1-0e89fae659a9).

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
