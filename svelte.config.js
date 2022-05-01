import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import wasmPack from 'vite-plugin-wasm-pack';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: adapterStatic(),
		vite: {
			build: {
				minify: false,
			},
			optimizeDeps: {
				include: ["@fortawesome/free-solid-svg-icons"],
				exclude: ['digisim']

			},
			ssr: {
				noExternal: ["@fortawesome/free-solid-svg-icons", "three"]
			},
			plugins: [
				wasmPack([], ['digisim'])
			]
		}

	}
};

export default config;
