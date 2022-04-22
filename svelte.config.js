import adapter from '@sveltejs/adapter-auto';
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
		adapter: adapter(),
		vite:{
            build: {
                minify: false,
            },
			optimizeDeps: {
				include: ["ts-results"],
                exclude: ['digisim']
			},
			ssr:{
				noExternal: ["ts-results"]
			},
            plugins: [
                wasmPack([], ['digisim'])
            ]
		},
	}
};

export default config;
