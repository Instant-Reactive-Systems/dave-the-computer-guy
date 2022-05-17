<script lang="ts">
	import { MeshStandardMaterial, BoxBufferGeometry, DoubleSide, Color } from 'three';
	import {
		Canvas,
		DirectionalLight,
		GLTF,
		HemisphereLight,
		Mesh,
		OrbitControls,
		PerspectiveCamera,
	} from 'threlte';
	import { getContext, onDestroy, onMount } from 'svelte';
	import NavigationPanel from '$lib/components/overlays/navigation_panel.svelte';
	import WardrobePanel from '../overlays/wardrobe_panel.svelte';
	import type { Item, ItemType } from '$lib/models/item';
	import type { HouseService } from '$lib/services/house_service';
	import { HOUSE_SERVICE } from '$lib/services/service';
	import type { Subscription } from 'rxjs';

	const { open, close } = getContext('simple-modal');

	const houseService: HouseService = getContext(HOUSE_SERVICE);

	const subscriptions: Subscription[] = [];

	let deskItem: Item;

	let chairItem: Item;

	let deskScale = {x:1, y:1, z:1};

	let pcScale = {x: 1, y:1, z:1};

	let chairScale = {x: 1, y:1, z:1};

	let tvScale = {x: 1, y:1, z:1};

	let doorScale = {x: 1, y:1, z:1};

	let pcItem: Item;

	let tvItem: Item;

	async function openItemPanel(itemType: ItemType) {
		const house = houseService.getHouseBehaviourSubject().getValue();
		const items = house.houseData[itemType].all;
		const selectedItemId = house.houseData[itemType].prefferedItemId;
		open(
			WardrobePanel,
			{
				itemType: itemType,
				items: items,
				selectedItemId: selectedItemId
			},
			{
				styleWindow: {
					width: '60%',
					overflow: 'hidden'
				},
				styleContent: {
					overflow: 'hidden'
				}
			}
		);
	}

	function openNavigationModal() {
		document.body.style.cursor = "default";
		open(NavigationPanel);
	}

	onMount(() => {
		subscriptions.push(
			houseService.getHouseBehaviourSubject().subscribe((house) => {
				if (house.id != 1) {
					return;
				} else {
					const items = [
						...house.houseData.chair.all,
						...house.houseData.desk.all,
						...house.houseData.bed.all,
						...house.houseData.pc.all,
						...house.houseData.tv.all
					];
					const deskItemId = house.houseData.desk.prefferedItemId;
					const chairItemId = house.houseData.chair.prefferedItemId;
					const pcItemId = house.houseData.pc.prefferedItemId;
					const tvItemId = house.houseData.tv.prefferedItemId;
					deskItem = items.find((item) => item.id == deskItemId);
					chairItem = items.find((item) => item.id == chairItemId);
					pcItem = items.find((item) => item.id == pcItemId);
					tvItem = items.find((item) => item.id == tvItemId);
				}
			})
		);
	});

	onDestroy(() => {
		console.log('Destroyed home');
		close();
	});
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
			on:pointerenter={()=> {
				doorScale = {x:1.01, y:1.01, z:1.01};
				document.body.style.cursor = "pointer";
			}}

			on:pointerleave={() => {
				doorScale = {x:1, y:1, z:1};
				document.body.style.cursor = "default";

			}}
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
			scale={doorScale}
			position={{ y: -0.4, x: 3, z: 4.85 }}
			rotation={{ y: 1 * (Math.PI / 180) }}
		/>

		<GLTF
			url="models/home/Decor-36.gltf"
			scale={{ x: 0.7, y: 0.7, z: 0.7 }}
			position={{ y: -0.5, x: 7, z: 1.3 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>
		<Mesh
			interactive
			on:click={() => openItemPanel('desk')}
			on:pointerenter={()=> {
				deskScale = {x:1.01, y:1.01, z:1.01};
				document.body.style.cursor = "pointer";
			}}

			on:pointerleave={() => {
				deskScale = {x:1, y:1, z:1};
				document.body.style.cursor = "default";

			}}
			visible={false}
			position={{ y: 0, x: 4, z: -1.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(3.3, 1.3, 1.4)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>
		<GLTF
			url={deskItem.url}
			scale={deskScale}
			position={{ y: -0.5, x: 4, z: -1.01 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>


		<GLTF
			url={pcItem.url}
			scale={pcScale}
			position={{ y: 0.6, x: 4, z: -1.01 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
		/>

		<GLTF
			url={chairItem.url}
			scale={chairScale}
			position={{ y: -0.4, x: 3, z: -1.7 }}
			rotation={{ y: 90 * (Math.PI / 180) }}
		/>

		<Mesh
			interactive
			on:click={() => openItemPanel('chair')}
			on:pointerenter={()=> {
				chairScale = {x:1.01, y:1.01, z:1.01};
				document.body.style.cursor = "pointer";
			}}

			on:pointerleave={() => {
				chairScale = {x:1, y:1, z:1};
				document.body.style.cursor = "default";

			}}
			visible={false}
			position={{ y: 0, x: 3, z: -1.7 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1.4, 1.01, 0.8)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<Mesh
			interactive
			on:click={() => openItemPanel('tv')}
			visible={false}
			on:pointerenter={()=> {
				tvScale = {x:1.01, y:1.01, z:1.01};
				document.body.style.cursor = "pointer";
			}}

			on:pointerleave={() => {
				tvScale = {x:1, y:1, z:1};
				document.body.style.cursor = "default";

			}}
			position={{ y: 1.01, x: -3, z: -4 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(0.5, 1.3, 2.4)}
			material={new MeshStandardMaterial({
				side: DoubleSide,
				color: 'white'
			})}
		/>

		<GLTF url={tvItem.url} scale={tvScale} position={{ y: 0.7, x: -3, z: -4 }} />
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
			on:click={() => openItemPanel('pc')}
			on:pointerenter={()=> {
				pcScale = {x:1.01, y:1.01, z:1.01};
				document.body.style.cursor = "pointer";
			}}

			on:pointerleave={() => {
				pcScale = {x:1, y:1, z:1};
				document.body.style.cursor = "default";

			}}
			visible={false}
			position={{ y: 1, x: 4, z: -1.6 }}
			rotation={{ y: -90 * (Math.PI / 180) }}
			geometry={new BoxBufferGeometry(1.4, 1.01, 0.8)}
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

