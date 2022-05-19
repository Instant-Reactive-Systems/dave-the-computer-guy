import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import wasmPack from 'vite-plugin-wasm-pack';
import rust from '@wasm-tool/rollup-plugin-rust';

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
		adapter: adapterStatic({fallback: 'index.html'}),
		vite: {
			build: {
				minify: false,
			},
			optimizeDeps: {
				exclude: ['digisim']

			},
			ssr: {
				noExternal: ["three"]
			},
			plugins: [
				wasmPack([], ['digisim']),
                rust({
                    verbose: true,
                    serverPath: "/build/_app/assets/"
                })
			]
		}

	}
};

export default config;
