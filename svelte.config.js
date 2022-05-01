import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

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
		vite:{
			optimizeDeps: {
				include: ["@fortawesome/free-solid-svg-icons"],
			},
			ssr:{
				noExternal: ["@fortawesome/free-solid-svg-icons","three"]
			}
		}

	}
};

export default config;
