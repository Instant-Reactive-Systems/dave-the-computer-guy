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
	import RoomPanel from '$lib/components/room_panel.svelte';
    import { getContext } from 'svelte';
	import ShopPanel from '$lib/components/overlays/shop_panel.svelte';

	const { open } = getContext('simple-modal');

	let roomPanelVisible = false;
	function showRoomPanel() {
		roomPanelVisible = true;
	}

	function hideRoomPanel() {
		roomPanelVisible = false;
	}

    function openShopPanel(){
        console.log("Opening shop panel");
        open(ShopPanel,{})
    }
</script>

{#if roomPanelVisible}
	<RoomPanel on:close={hideRoomPanel} />
{/if}
<div>
	<Canvas>
		<PerspectiveCamera position={{ x: -10, y: 10, z: -10 }}>
			<OrbitControls />
		</PerspectiveCamera>

		<DirectionalLight shadow color={'white'} position={{ x: -15, y: 45, z: 20 }} />
		<HemisphereLight skyColor={'white'} groundColor={'#ac844c'} intensity={0.4} />

		<Mesh
			interactive
			on:click={showRoomPanel}
			visible={false}
			position={{ y: 2, x: 6.2, z: -2.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(2, 2.8, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<Mesh
			receiveShadow
			position={{ y: 0, x: 0.5 }}
			rotation={{ x: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(12, 8, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<Mesh
			receiveShadow
			position={{ y: 1.8, x: 6.4 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(8, 3.5, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>
		<Mesh
			receiveShadow
			position={{ y: 1.8, x: 0.5, z: 3.9 }}
			geometry={new BoxBufferGeometry(12, 3.5, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF
			url="models/office/Office_Misc_Door_01.gltf"
			position={{ y: 0.1, x: 6.2, z: -2.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF url="models/office/Office_Table_White_2x1_02.gltf" position={{ y: 0.1, x: 4.5, z: 0 }} />

		<GLTF
			url="models/office/Office_Chair_White_04.gltf"
			position={{ y: 0.1, x: 4.5, z: 1 }}
			rotation={{ y: Math.PI }}
		/>

		<GLTF
			url="models/office/Office_Misc_PC_01.gltf"
			position={{ y: 1.2, x: 5.5, z: 0 }}
			rotation={{ y: -Math.PI / 4 }}
		/>

		<GLTF
			url="models/office/Office_Misc_Phone.gltf"
			position={{ y: 1.2, x: 4.5, z: -0.45 }}
			scale={{ x: 0.6, y: 0.6, z: 0.6 }}
		/>

		<GLTF url="models/office/Office_Misc_Plant_03.gltf" position={{ y: 0.1, x: 5.7, z: 3.2 }} />

		<GLTF
			url="models/shop/rack/scene.gltf"
			position={{ y: 0.1, x: 2.5, z: 3.7 }}
			rotation={{ y: Math.PI / 2 }}
		/>

		<GLTF
			url="models/shop/delux_bookshelf/scene.gltf"
			position={{ y: 1.1, x: 0, z: 3.55 }}
			rotation={{ y: Math.PI / 2 }}
		/>

		<GLTF
			url="models/shop/delux_bookshelf/scene.gltf"
			position={{ y: 1.1, x: -2.5, z: 3.55 }}
			rotation={{ y: Math.PI / 2 }}
		/>

		<!-- Rack -->
		<GLTF
			url="models/shop/closed-circuit-2.gltf"
			position={{ y: 1.65, x: 2.3, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-2.gltf"
			position={{ y: 1.65, x: 1.8, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.25, x: 2.3, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.25, x: 1.8, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-1.gltf"
			position={{ y: 0.85, x: 2.3, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-1.gltf"
			position={{ y: 0.85, x: 1.8, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-4.gltf"
			position={{ y: 0.45, x: 2.3, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-4.gltf"
			position={{ y: 0.45, x: 1.8, z: 3.3 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<!-- Shelf A -->
		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: 0.725, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: 0.425, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: -0.375, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: -0.675, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: 0.725, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: 0.425, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: -0.375, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: -0.675, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: 0.725, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: 0.425, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: -0.375, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: -0.675, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: 0.725, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: 0.425, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: -0.375, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: -0.675, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<!-- Shelf B -->
		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: -1.755, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: -2.055, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: -2.875, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-3.gltf"
			position={{ y: 0.35, x: -3.175, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: -1.755, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: -2.055, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: -2.875, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/closed-circuit-1.gltf"
			position={{ y: 0.75, x: -3.175, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: -1.755, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: -2.055, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: -2.875, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-2.gltf"
			position={{ y: 1.15, x: -3.175, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: -1.755, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: -2.055, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: -2.875, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<GLTF
			url="models/shop/open-circuit-3.gltf"
			position={{ y: 1.55, x: -3.175, z: 3.55 }}
			rotation={{ y: 2 * Math.PI }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>
        <Mesh
			interactive
			on:click={openShopPanel}
			visible={false}
			position={{ y: 1.2, x: 4.5, z: 1.2 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1, 2, 0.9)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF
			url="models/shop/clerk-sitting-1.gltf"
			receiveShadow
			rotation={{ y: 180 * (Math.PI / 180) }}
			position={{ y: 0.2, x: 4.55, z: 0.5 }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>
	</Canvas>
</div>

<style>
	div {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
