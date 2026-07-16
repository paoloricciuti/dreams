<script lang="ts">
	import { dream_transition_name, format_date, type Dream } from '$lib/dreams';
	import { get_dreams } from '$lib/dreams.remote';

	// chronological, oldest first — straight from the diary's atproto repo
	const dreams = await get_dreams();

	// newest first — the order a diary shows itself
	const dreams_newest_first = $derived(dreams.toReversed());

	/**
	 * Deterministic scatter over a 12-column grid, for any number of dreams.
	 * A dream's spot never changes once logged: the side of the field comes
	 * from its position in the *chronological* diary (stable forever, since
	 * new dreams are only ever logged after old ones), and everything else
	 * comes from a hash of its slug. Alternating by night keeps the left and
	 * right bands evenly woven no matter how many entries there are.
	 */
	function field_hash(slug: string): number {
		let h = 0;
		for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 997;
		return h;
	}

	const chrono = new Map(dreams.map((dream, i) => [dream.slug, i]));

	function field_place(dream: Dream): string {
		const h = field_hash(dream.slug);
		// unknown slugs (not in the diary module) still get a stable spot
		const night = chrono.get(dream.slug) ?? chrono.size + h;
		const portrait = dream.aspect < 1;
		const span = portrait ? 3 + (h % 2) : 4 + (h % 2);
		// odd nights on one side of the field, even nights on the other
		const left = night % 2 === 0;
		const start = left ? 1 + (h % 3) : Math.min(13 - span, 7 + (h % 3));
		// every fifth night rises into the previous row's air; the rest sink
		const rises = night % 5 === 0;
		const top = rises ? -(2 + (h % 3)) : 3 + (h % 5);
		return `grid-column: ${start} / span ${span}; margin-top: ${top}rem;`;
	}
</script>

<svelte:head>
	<title>Dreams — a diary of them</title>
	<meta
		name="description"
		content="A public diary of real dreams, each one rendered into an image. They sit out in the fog; whatever you look at becomes clear."
	/>
</svelte:head>

<main>
	<div class="weather" aria-hidden="true"></div>

	<header>
		<h1>Dreams</h1>
		<p class="lede">
			These are real. I dream them, write them down, and a machine paints them from my notes. They
			sit out here in the fog — whatever you look at becomes clear.
		</p>
	</header>

	<section class="field" aria-label="The dreams, newest first">
		{#each dreams_newest_first as dream, i (dream.slug)}
			<a href="/{dream.slug}" class="dream" style={field_place(dream)}>
				<figure
					style="aspect-ratio: {dream.aspect}"
					style:view-transition-name={dream_transition_name('image', dream.slug)}
				>
					<img
						src={dream.image_url}
						alt={dream.alt}
						loading={i < 3 ? 'eager' : 'lazy'}
						decoding="async"
					/>
				</figure>
				<span class="label">
					<time datetime={dream.date}>{format_date(dream.date)}</time>
					<strong style:view-transition-name={dream_transition_name('title', dream.slug)}
						>{dream.title}</strong
					>
				</span>
			</a>
		{/each}
	</section>

	<footer>
		<p>There are more of them out there. The fog is not empty; it is patient.</p>
	</footer>
</main>

<style>
	main {
		position: relative;
		overflow-x: clip;
	}

	/* — slow weather over everything — */
	.weather {
		position: fixed;
		inset: -20%;
		pointer-events: none;
		z-index: var(--z-veil);
		background:
			radial-gradient(ellipse 45% 30% at 20% 30%, oklch(98% 0.004 235 / 0.55), transparent),
			radial-gradient(ellipse 50% 35% at 80% 60%, oklch(98.5% 0.004 235 / 0.5), transparent),
			radial-gradient(ellipse 40% 28% at 45% 85%, oklch(98% 0.004 235 / 0.45), transparent);
		animation: weather 70s ease-in-out infinite alternate;
	}

	@keyframes weather {
		to {
			transform: translate(6%, -4%) scale(1.15);
		}
	}

	header {
		position: relative;
		text-align: center;
		padding: clamp(5rem, 16vh, 10rem) clamp(2rem, 6vw, 4rem) clamp(3rem, 8vh, 6rem);
	}

	h1 {
		font-size: var(--text-3xl);
	}

	.lede {
		max-width: 44ch;
		margin: 1.5rem auto 0;
		color: var(--ink-soft);
	}

	/* — the field — */
	.field {
		position: relative;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: clamp(1rem, 2vw, 2rem);
		max-width: 90rem;
		margin-inline: auto;
		padding: 0 clamp(1.5rem, 4vw, 4rem) clamp(4rem, 10vh, 7rem);
	}

	/* 1 = deep in the fog, 0 = clear. Registered so it can animate and inherit. */
	@property --fog {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.dream {
		display: block;
		text-decoration: none;
		/* scroll-driven: the fog clears as the dream rises, and is fully gone
		   once its bottom edge is 15% of the viewport above the bottom */
		animation: defog linear both;
		animation-timeline: view(block 0% 15%);
		animation-range: entry;
	}

	@keyframes defog {
		from {
			--fog: 1;
		}
		to {
			--fog: 0;
		}
	}

	figure {
		overflow: hidden;
	}

	figure img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(calc(var(--fog) * 7px)) saturate(calc(1 - var(--fog) * 0.75))
			brightness(calc(1 + var(--fog) * 0.1)) contrast(calc(1 - var(--fog) * 0.15));
		transform: scale(calc(1 + var(--fog) * 0.06));
		/* smooths both the hover reveal and the scroll-driven one inherited from .dream */
		transition: --fog 1.1s var(--ease-fog);
	}

	/* a declaration set directly on the img beats the animated value inherited
	   from .dream, so hover always clears whatever fog the scroll left behind */
	.dream:hover img,
	.dream:focus-visible img {
		--fog: 0;
	}

	.label {
		display: block;
		margin-top: 0.7rem;
		opacity: 0;
		transition: opacity 0.9s var(--ease-fog);
	}

	.dream:hover .label,
	.dream:focus-visible .label {
		opacity: 1;
	}

	.label time {
		display: block;
		font-size: var(--text-xs);
		color: var(--ink-soft);
	}

	.label strong {
		font-family: var(--font-dream);
		font-weight: 400;
		font-size: var(--text-base);
	}

	/* touch and no-hover devices: the labels stay; where the browser can't
	   defog on scroll, fall back to a permanently thin fog instead */
	@media (hover: none) {
		@supports not (animation-timeline: view()) {
			figure img {
				--fog: 0.3;
			}
		}

		.label {
			opacity: 1;
		}
	}

	@media (max-width: 40rem) {
		.field {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.dream {
			grid-column: 1 !important;
			margin-top: 0 !important;
		}

		.dream:nth-child(even) {
			width: 86%;
			margin-left: auto !important;
		}
	}

	footer {
		position: relative;
		text-align: center;
		padding: 0 2rem clamp(4rem, 10vh, 7rem);
		color: var(--ink-soft);
		font-size: var(--text-sm);
	}
</style>
