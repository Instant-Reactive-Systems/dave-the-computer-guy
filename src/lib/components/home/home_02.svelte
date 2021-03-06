<script lang="ts">
	import { MeshStandardMaterial, BoxBufferGeometry, DoubleSide } from 'three';
	import {
		Canvas,
		DirectionalLight,
		GLTF,
		HemisphereLight,
		Mesh,
		OrbitControls,
		PerspectiveCamera
	} from 'threlte';
	import { goto } from '$app/navigation';
	import { getContext, onDestroy, onMount } from 'svelte';
    import { Router } from "$lib/router";
    import NavigationPanel from '$lib/components/overlays/navigation_panel.svelte';
    import WardrobePanel from '../overlays/wardrobe_panel.svelte';

	const { open, close } = getContext('simple-modal');

	function openItemPanel() {
		open(WardrobePanel, {}, {
			styleWindow: {
				width: "60%",
				overflow: "hidden"
			},
			styleContent: {
				overflow: "hidden"
			}
		});
	}

    function openNavigationModal() {
		open(NavigationPanel);
	}

	onMount(()=> {
		console.log("Mounted home");
	})

	onDestroy(()=> {
		console.log("Destroyed home");
        close();
	})



</script>

<main>
	<Canvas>
		<PerspectiveCamera position={{ x: -10, y: 10, z: -10 }}>
			<OrbitControls />
		</PerspectiveCamera>

		<DirectionalLight shadow color={'white'} position={{ x: -15, y: 45, z: 20 }} />

		<HemisphereLight skyColor={'white'} groundColor={'#ac844c'} intensity={0.4} />

		<Mesh
			receiveShadow
			position={{ y: -0.5, x: 0 }}
			rotation={{ x: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(10, 10, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<Mesh
			receiveShadow
			rotation={{ y: 90 * (Math.PI / 180) }}
			position={{ y: 1.2, x: 4.9 }}
			geometry={new BoxBufferGeometry(10, 3.5, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<Mesh
			interactive
			receiveShadow
			position={{ y: 1.2, x: 0, z: 5 }}
			geometry={new BoxBufferGeometry(10, 3.5, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<Mesh
			interactive
			on:click={openNavigationModal}
			visible={false}
			position={{ y: 1, x: 3, z: 4.8 }}
			rotation={{ y: 0 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(2, 2.8, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>
		<GLTF
			url="models/office/Office_Misc_Door_01.gltf"
			position={{ y: -0.4, x: 3, z: 4.85 }}
			rotation={{ y: 1 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/home/Decor-36.gltf"
			scale={{ x: 0.7, y: 0.7, z: 0.7 }}
			position={{ y: -0.5, x: 7, z: 1.3 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/office/Office_Table_White_3x1_02.gltf"
			position={{ y: -0.5, x: 4, z: -1.5 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/office/Office_Misc_PC_01.gltf"
			position={{ y: 0.6, x: 4, z: -1.5 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/office/Office_Chair_White_02.gltf"
			position={{ y: -0.4, x: 3, z: -1.7 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
		/>

		<GLTF url="models/office/Office_Misc_TV_Stand_02.gltf" position={{ y: 0.7, x: -3, z: -4 }} />
		<GLTF
			url="models/office/Office_Table_White_3x1_02.gltf"
			position={{ y: -0.4, x: -2.5, z: -4 }}
		/>
		<GLTF
			url="models/office/Office_Misc_Console_Woo_01.gltf"
			position={{ y: 0.7, x: -1.2, z: -4 }}
		/>
		<GLTF
			url="models/office/Office_Misc_Cabinet_01.gltf"
			position={{ y: -0.4, x: -0.8, z: 4.2 }}
			rotation={{ y: Math.PI }}
		/>
		<GLTF
			url="models/office/Office_Misc_Cabinet_01.gltf"
			position={{ y: -0.4, x: 0.35, z: 4.2 }}
			rotation={{ y: Math.PI }}
		/>

		<Mesh
			interactive
			on:click={openItemPanel}
			visible={true}
			position={{ y: 1, x: 4, z: -1.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1.4, 1.5, 0.8)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF
			url="models/office/player-sitting-1.gltf"
			receiveShadow
			rotation={{ y: 90 * (Math.PI / 180) }}
			position={{ y: -0.35, x: 3.4, z: -1.65 }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>
	</Canvas>
</main>

<style>
	main {
		--hgt: calc(theme(height.screen) - theme(height.10));
        height: var(--hgt);
		max-height: var(--hgt);
		min-height: var(--hgt);
        @apply w-full;
	}
</style>

