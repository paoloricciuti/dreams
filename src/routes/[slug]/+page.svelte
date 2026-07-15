<script lang="ts">
	import { format_date } from '$lib/dreams';
	import { get_dream } from '$lib/dreams.remote';

	let { params } = $props();

	const data = $derived(await get_dream(params.slug));
	const dream = $derived(data.dream);
</script>

<svelte:head>
	<title>{dream.title} — Dreams</title>
	<meta name="description" content={dream.fragment} />
</svelte:head>

<nav>
	<a href="/">⟵ back into the fog</a>
</nav>

<main>
	<header class="clearing">
		<figure style="aspect-ratio: {dream.aspect}" class:tall={dream.aspect < 1}>
			<img src={dream.image_url} alt={dream.alt} fetchpriority="high" />
		</figure>
		<div class="plate">
			<time datetime={dream.date}>{format_date(dream.date)}</time>
			<h1>{dream.title}</h1>
		</div>
	</header>

	<article>
		<p class="fragment">“{dream.fragment}”</p>
		{#each dream.story as paragraph, i (i)}
			<p>{paragraph}</p>
		{/each}
	</article>

	<footer aria-label="Neighbouring nights">
		{#if data.night_before}
			<a href="/3/{data.night_before.slug}">
				<span>the night before</span>
				{data.night_before.title}
			</a>
		{:else}
			<span class="edge">this is the first night</span>
		{/if}
		{#if data.night_after}
			<a class="after" href="/3/{data.night_after.slug}">
				<span>the night after</span>
				{data.night_after.title}
			</a>
		{:else}
			<span class="edge after">this is the last night, so far</span>
		{/if}
	</footer>
</main>

<style>
	nav {
		position: absolute;
		top: 0;
		left: 0;
		padding: 1.5rem clamp(1.5rem, 4vw, 3rem);
		z-index: var(--z-nav);
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
		padding-bottom: clamp(3rem, 8vh, 6rem);
	}

	/* — the clearing: fog pulls back off the image once — */
	.clearing {
		min-height: 100dvh;
		display: grid;
		place-content: center;
		justify-items: center;
		padding: clamp(4rem, 8vh, 6rem) clamp(1rem, 3vw, 3rem) 0;
	}

	figure {
		width: min(80vw, 68rem);
		max-height: 72vh;
		overflow: hidden;
	}

	figure.tall {
		width: auto;
		height: min(72vh, 44rem);
		max-width: 94vw;
	}

	figure img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		animation: clearing 2s var(--ease-fog) both;
	}

	@keyframes clearing {
		from {
			filter: blur(22px) saturate(0.15) brightness(1.15) contrast(0.8);
			transform: scale(1.05);
		}
	}

	.plate {
		text-align: center;
		margin-top: 2rem;
		animation: settle 1.4s var(--ease-fog) 0.5s both;
	}

	@keyframes settle {
		from {
			opacity: 0;
		}
	}

	.plate time {
		font-size: var(--text-sm);
		color: var(--ink-soft);
	}

	h1 {
		font-size: var(--text-2xl);
		margin-top: 0.4rem;
	}

	article {
		max-width: 62ch;
		margin: clamp(3rem, 10vh, 6rem) auto 0;
		padding-inline: clamp(1.5rem, 5vw, 3rem);
	}

	.fragment {
		font-family: var(--font-dream);
		font-size: var(--text-xl);
		line-height: 1.3;
		color: var(--ink-soft);
		margin-bottom: 2.5rem;
		max-width: 24ch;
	}

	article p + p {
		margin-top: 1.4rem;
	}

	footer {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		max-width: 62ch;
		margin: clamp(3rem, 8vh, 5rem) auto 0;
		padding: 2rem clamp(1.5rem, 5vw, 3rem) 0;
		border-top: 1px solid var(--line);
		font-family: var(--font-dream);
	}

	footer a {
		text-decoration: none;
		max-width: 45%;
	}

	footer a:hover {
		color: var(--accent);
	}

	footer span {
		display: block;
		font-family: var(--font-diary);
		font-size: var(--text-xs);
		color: var(--ink-soft);
		margin-bottom: 0.3rem;
	}

	.after {
		text-align: right;
		margin-left: auto;
	}

	.edge {
		font-family: var(--font-diary);
		font-size: var(--text-sm);
		color: var(--ink-soft);
		align-self: center;
	}
</style>
