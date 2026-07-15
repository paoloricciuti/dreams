<script lang="ts">
	import { edit_dream, get_dream_admin, remove_dream } from '$lib/admin.remote';
	import { IMAGE_TYPES } from '$lib/dream_form';

	let { params } = $props();

	const dream = $derived(await get_dream_admin(params.slug));
</script>

<svelte:head>
	<title>Rewriting “{dream.title}” — Dreams</title>
</svelte:head>

<nav>
	<a href="/admin">⟵ back to the desk</a>
</nav>

<main>
	<section class="desk">
		<header>
			<h1>Rewrite the dream</h1>
			<p class="lede">
				Dreams shift when you look back at them. The address stays: <code>/{dream.slug}</code>
			</p>
		</header>

		<form {...edit_dream} enctype="multipart/form-data">
			<input {...edit_dream.fields.slug.as('hidden', dream.slug)} />

			<label>
				<span>title</span>
				<input {...edit_dream.fields.title.as('text', dream.title)} />
				{#each edit_dream.fields.title.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>the night it was dreamed</span>
				<input {...edit_dream.fields.date.as('date', dream.date)} />
				{#each edit_dream.fields.date.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>fragment — one line the dream said</span>
				<input {...edit_dream.fields.fragment.as('text', dream.fragment)} />
				{#each edit_dream.fields.fragment.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<label>
				<span>the story — blank line between paragraphs</span>
				<textarea {...edit_dream.fields.story.as('text', dream.story.join('\n\n'))} rows="12"
				></textarea>
				{#each edit_dream.fields.story.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<div class="image-field">
				<span>the image — leave empty to keep this one</span>
				<img src={dream.image_url} alt={dream.alt} style="aspect-ratio: {dream.aspect}" />
				<input {...edit_dream.fields.image.as('file')} accept={IMAGE_TYPES.join(',')} />
				{#each edit_dream.fields.image.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</div>

			<label>
				<span>alt text — describe the image the way the diary would</span>
				<textarea {...edit_dream.fields.alt.as('text', dream.alt)} rows="3"></textarea>
				{#each edit_dream.fields.alt.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
			</label>

			<button disabled={!!edit_dream.pending}>
				{edit_dream.pending ? 'rewriting…' : 'rewrite it'}
			</button>
		</form>
	</section>

	<section class="fade">
		<h2>Let it fade</h2>
		<p class="lede">
			This takes “{dream.title}” out of the diary and out of the repo. There is no waking it back
			up.
		</p>
		<form
			{...remove_dream.enhance(async (form) => {
				if (confirm(`Let “${dream.title}” fade? There is no waking it back up.`)) {
					await form.submit();
				}
			})}
		>
			<input {...remove_dream.fields.slug.as('hidden', dream.slug)} />
			<button class="danger" disabled={!!remove_dream.pending}>
				{remove_dream.pending ? 'fading…' : 'let it fade'}
			</button>
		</form>
	</section>
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

	.lede code {
		font-size: var(--text-sm);
	}

	form {
		margin-top: clamp(2rem, 5vh, 3rem);
		display: grid;
		gap: 1.6rem;
	}

	label,
	.image-field {
		display: grid;
		gap: 0.45rem;
	}

	label span,
	.image-field span {
		font-size: var(--text-xs);
		color: var(--ink-soft);
	}

	.image-field img {
		max-width: 14rem;
		border: 1px solid var(--line);
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

	/* — deletion — */
	.fade {
		margin-top: clamp(3rem, 8vh, 5rem);
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}

	.fade form {
		margin-top: 1.5rem;
	}

	button.danger {
		border-color: oklch(55% 0.12 25);
		color: oklch(45% 0.12 25);
	}

	button.danger:hover {
		background: oklch(45% 0.12 25);
		color: var(--surface);
	}
</style>
