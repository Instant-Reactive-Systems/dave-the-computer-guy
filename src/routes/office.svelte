<script lang="ts">
	import { MeshStandardMaterial, BoxBufferGeometry, DoubleSide } from 'three';
	import TutorialPanel from '$lib/components/overlays/tutorial_panel.svelte';
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
	import QuestsPanel from '$lib/components/overlays/quests_panel.svelte';
    import { goto } from '$app/navigation'

	const { open } = getContext('simple-modal');
 
	let roomPanelVisible = false;
	function showRoomPanel() {
		roomPanelVisible = true;
	}

	function openTutorialPanel() {
		open(TutorialPanel, {});
	}

	function openQuestsPanel() {
		open(QuestsPanel, {});
	}

	function hideRoomPanel() {
		roomPanelVisible = false;
	}

    function navigateToSimulator(){
        goto('simulator',{replaceState: true})
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
			receiveShadow
			position={{ y: -0.5, x: -2.5 }}
			rotation={{ x: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(15, 10, 0.2)}
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
			position={{ y: 1.2, x: -2.5, z: 5 }}
			geometry={new BoxBufferGeometry(15, 3.5, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF
			url="models/office/Office_Chair_Brown_01.gltf"
			receiveShadow
			position={{ y: -0.4, x: 2.5, z: -0.7 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Chair_Brown_01.gltf"
			receiveShadow
			position={{ y: -0.4, x: 2.5, z: 1.5 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Table_Brown_3x1_01.gltf"
			receiveShadow
			position={{ y: -0.4, x: 4, z: 0.5 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<Mesh
			interactive
			on:click={navigateToSimulator}
			visible={false}
			position={{ y: 1, x: 4, z: -0.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1.4, 1.5, 0.8)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF
			url="models/office/Office_Misc_PC_01.gltf"
			receiveShadow
			position={{ y: 0.7, x: 4, z: -0.5 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Misc_PC_01.gltf"
			receiveShadow
			position={{ y: 0.7, x: 4, z: 1.8 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/office/Office_Misc_PC_01.gltf"
			receiveShadow
			position={{ y: 0.7, x: -5.2, z: 3.7 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/office/Office_Misc_Plant_03.gltf"
			position={{ y: -0.4, x: 4, z: 4.2 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>
		<Mesh
			interactive
			on:click={showRoomPanel}
			visible={false}
			position={{ y: 2, x: 4.85, z: -3.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(2, 2.8, 0.2)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>
		<GLTF
			url="models/office/Office_Misc_Door_01.gltf"
			position={{ y: -0.4, x: 4.85, z: -3.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Table_Brown_2x2_02.gltf"
			position={{ y: -0.4, x: -6, z: 3 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Chair_Brown_01.gltf"
			receiveShadow
			position={{ y: -0.4, x: -6, z: 3.5 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Misc_Trashcan_Small_03.gltf"
			receiveShadow
			position={{ y: -0.4, x: 4, z: -2.5 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
		/>
		<GLTF
			url="models/office/Office_Misc_Printer.gltf"
			receiveShadow
			position={{ y: 0.7, x: -6.8, z: 2.2 }}
			rotation={{}}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Misc_Papers.gltf"
			receiveShadow
			position={{ y: 0.7, x: -5.5, z: 2.2 }}
			rotation={{}}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Misc_Whiteboard_01.gltf"
			receiveShadow
			position={{ y: 1.2, x: -7, z: 5.5 }}
			rotation={{}}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Misc_Cabinet_02.gltf"
			receiveShadow
			position={{ y: -0.35, x: -3, z: 4.3 }}
			rotation={{ y: Math.PI }}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Misc_Cabinet_02.gltf"
			receiveShadow
			position={{ y: -0.35, x: -2, z: 4.3 }}
			rotation={{ y: Math.PI }}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Couch_Brown_02.gltf"
			receiveShadow
			rotation={{ y: 90 * (Math.PI / 180) }}
			position={{ y: -0.35, x: -6, z: -2 }}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Couch_Brown_02.gltf"
			receiveShadow
			position={{ y: -0.35, x: -4, z: -3.7 }}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Couch_Brown_02.gltf"
			receiveShadow
			rotation={{ y: 270 * (Math.PI / 180) }}
			position={{ y: -0.35, x: -2, z: -2 }}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>
		<GLTF
			url="models/office/Office_Table_Coffee_03_Brown.gltf"
			receiveShadow
			rotation={{ y: 180 * (Math.PI / 180) }}
			position={{ y: -0.35, x: -4, z: -2 }}
			scale={{ x: 0.8, y: 0.8, z: 0.8 }}
		/>

		<Mesh
			interactive
			on:click={openQuestsPanel}
			visible={false}
			position={{ y: 0.4, x: -6, z: 3.4 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1.4, 2.8, 0.9)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>
		<GLTF
			url="models/office/boss-sitting-1.gltf"
			receiveShadow
			rotation={{ y: 90 * (Math.PI / 180) }}
			position={{ y: -0.35, x: -5.5, z: 3.55 }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>

		<Mesh
			interactive
			on:click={openTutorialPanel}
			visible={false}
			position={{ y: 0.4, x: 2.5, z: 1.55 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1.4, 2.8, 0.9)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF
			url="models/office/john-dodi-sitting-1.gltf"
			receiveShadow
			rotation={{ y: 90 * (Math.PI / 180) }}
			position={{ y: -0.35, x: 2.9, z: 1.55 }}
			scale={{ x: 0.2, y: 0.2, z: 0.2 }}
		/>
		<GLTF
			url="models/office/player-sitting-1.gltf"
			receiveShadow
			rotation={{ y: 90 * (Math.PI / 180) }}
			position={{ y: -0.35, x: 2.9, z: -0.65 }}
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
