<script lang="ts">
	/**
	 * The card satori renders into the og:image for a dream. Satori only
	 * understands inline styles and needs display:flex on every element with
	 * more than one child; it can't parse oklch, so the colors below are hex
	 * approximations of the tokens in app.css.
	 */
	let {
		image,
		title,
		date,
		fragment
	}: {
		/** URL of the dream image — satori fetches and embeds it during render */
		image: string;
		title: string;
		/** already formatted for display */
		date: string;
		fragment: string;
	} = $props();

	// satori doesn't wrap-and-shrink, so long titles step down a size
	const title_size = $derived(title.length > 42 ? 40 : title.length > 24 ? 50 : 60);
</script>

<div
	style="display: flex; width: 100%; height: 100%; background-color: #f0f3f5; color: #23282e; font-family: Karla;"
>
	<img src={image} alt="" style="width: 540px; height: 630px; object-fit: cover;" />

	<div
		style="display: flex; flex-direction: column; justify-content: center; flex: 1; padding: 56px 64px 56px 60px;"
	>
		<div style="display: flex; font-size: 22px; color: #59626d;">{date}</div>
		<h1
			style="font-family: Gloock; font-weight: 400; font-size: {title_size}px; line-height: 1.08; letter-spacing: -0.01em; margin: 14px 0 0;"
		>
			{title}
		</h1>
		<p
			style="font-family: Gloock; font-size: 27px; line-height: 1.35; color: #59626d; margin: 36px 0 0;"
		>
			“{fragment}”
		</p>
	</div>

	<div
		style="position: absolute; bottom: 40px; right: 64px; display: flex; font-size: 20px; color: #59626d;"
	>
		Dreams — a diary of them
	</div>
</div>
