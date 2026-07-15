<script lang="ts">
	import { admin_logout, log_dream } from '$lib/admin.remote';
	import { get_dreams } from '$lib/dreams.remote';
	import { format_date } from '$lib/dreams';
	import { IMAGE_TYPES } from '$lib/dream_form';

	const today = new Date().toISOString().slice(0, 10);
</script>

<svelte:head>
	<title>The desk — Dreams</title>
</svelte:head>

<nav>
	<a href="/">⟵ back into the fog</a>
</nav>

<main>
	<section class="desk">
		<header>
			<h1>Log a dream</h1>
			<p class="lede">Write it down before it fades. The image goes with it, into the repo.</p>
		</header>

		<form {...log_dream} enctype="multipart/form-data">
			<label>
				<span>title</span>
				<input {...log_dream.fields.title.as('text')} />
				{#each log_dream.fields.title.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>the night it was dreamed</span>
				<input {...log_dream.fields.date.as('date', today)} />
				{#each log_dream.fields.date.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>fragment — one line the dream said</span>
				<input {...log_dream.fields.fragment.as('text')} />
				{#each log_dream.fields.fragment.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>the story — blank line between paragraphs</span>
				<textarea {...log_dream.fields.story.as('text')} rows="12"></textarea>
				{#each log_dream.fields.story.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>the image</span>
				<input {...log_dream.fields.image.as('file')} accept={IMAGE_TYPES.join(',')} />
				{#each log_dream.fields.image.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>alt text — describe the image the way the diary would</span>
				<textarea {...log_dream.fields.alt.as('text')} rows="3"></textarea>
				{#each log_dream.fields.alt.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<button disabled={!!log_dream.pending}>
				{log_dream.pending ? 'logging…' : 'log it'}
			</button>
		</form>
	</section>

	<section class="diary">
		<h2>The diary so far</h2>
		{#each (await get_dreams()).toReversed() as dream (dream.slug)}
			<a class="entry" href="/admin/{dream.slug}">
				<time datetime={dream.date}>{format_date(dream.date)}</time>
				<strong>{dream.title}</strong>
				<span class="hint">edit</span>
			</a>
		{:else}
			<p class="lede">Nothing has been logged yet. The fog is waiting.</p>
		{/each}
	</section>

	<form class="leave" {...admin_logout}>
		<button disabled={!!admin_logout.pending}>stand up and leave the desk</button>
	</form>
</main>

<style>
	nav {
		padding: 1.5rem clamp(1.5rem, 4vw, 3rem);
	}

	nav a {
		font-size: var(--text-sm);
		color: var(--ink-soft);
		text-decoration: none;
	}

	nav a:hover {
		color: var(--ink);
	}

	main {
		max-width: 40rem;
		margin-inline: auto;
		padding: clamp(2rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem) clamp(4rem, 10vh, 7rem);
	}

	h1 {
		font-size: var(--text-2xl);
	}

	h2 {
		font-size: var(--text-lg);
	}

	.lede {
		margin-top: 1rem;
		color: var(--ink-soft);
	}

	form {
		margin-top: clamp(2rem, 5vh, 3rem);
		display: grid;
		gap: 1.6rem;
	}

	label {
		display: grid;
		gap: 0.45rem;
	}

	label span {
		font-size: var(--text-xs);
		color: var(--ink-soft);
	}

	input,
	textarea {
		font: inherit;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 2px;
		padding: 0.6rem 0.8rem;
	}

	textarea {
		resize: vertical;
		line-height: 1.6;
	}

	input[aria-invalid='true'],
	textarea[aria-invalid='true'] {
		border-color: oklch(55% 0.12 25);
	}

	.issue {
		font-size: var(--text-sm);
		color: oklch(45% 0.12 25);
	}

	button {
		justify-self: start;
		font: inherit;
		font-size: var(--text-sm);
		color: var(--ink);
		background: none;
		border: 1px solid var(--ink-soft);
		border-radius: 2px;
		padding: 0.65rem 1.6rem;
		cursor: pointer;
		transition: border-color 0.4s var(--ease-fog);
	}

	button:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	/* — the diary list — */
	.diary {
		margin-top: clamp(3rem, 8vh, 5rem);
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}

	.entry {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: baseline;
		gap: 1rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
	}

	.entry time {
		font-size: var(--text-xs);
		color: var(--ink-soft);
	}

	.entry strong {
		font-family: var(--font-dream);
		font-weight: 400;
	}

	.entry .hint {
		font-size: var(--text-xs);
		color: var(--ink-soft);
		opacity: 0;
		transition: opacity 0.4s var(--ease-fog);
	}

	.entry:hover .hint,
	.entry:focus-visible .hint {
		opacity: 1;
	}

	.entry:hover strong {
		color: var(--accent);
	}

	/* — leaving — */
	.leave {
		margin-top: clamp(3rem, 8vh, 5rem);
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}

	.leave button {
		border: none;
		padding: 0;
		color: var(--ink-soft);
	}

	.leave button:hover {
		color: var(--accent);
	}
</style>
