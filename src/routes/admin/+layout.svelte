<script lang="ts">
	import { admin_login, get_admin_status } from '$lib/admin.remote';

	let { children } = $props();

	const is_admin = $derived(await get_admin_status());
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	{#if !is_admin}
		<title>The desk — Dreams</title>
	{/if}
</svelte:head>

{#if is_admin}
	{@render children()}
{:else}
	<nav>
		<a href="/">⟵ back into the fog</a>
	</nav>

	<main>
		<section class="gate">
			<h1>The desk</h1>
			<p class="lede">Only the dreamer sits here.</p>

			<form {...admin_login}>
				<label>
					<span>password</span>
					<input {...admin_login.fields._password.as('password')} autocomplete="current-password" />
				</label>
				{#each admin_login.fields._password.issues() ?? [] as issue, i (i)}
					<p class="issue">{issue.message}</p>
				{/each}
				<button disabled={!!admin_login.pending}>sit down</button>
			</form>
		</section>
	</main>
{/if}

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

	.gate {
		min-height: 60dvh;
		display: grid;
		place-content: center;
		text-align: center;
	}

	h1 {
		font-size: var(--text-2xl);
	}

	.lede {
		margin-top: 1rem;
		color: var(--ink-soft);
	}

	form {
		margin-top: clamp(2rem, 5vh, 3rem);
		display: grid;
		gap: 1.6rem;
		justify-items: center;
	}

	label {
		display: grid;
		gap: 0.45rem;
	}

	label span {
		font-size: var(--text-xs);
		color: var(--ink-soft);
	}

	input {
		font: inherit;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 2px;
		padding: 0.6rem 0.8rem;
	}

	.issue {
		font-size: var(--text-sm);
		color: oklch(45% 0.12 25);
	}

	button {
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
</style>
