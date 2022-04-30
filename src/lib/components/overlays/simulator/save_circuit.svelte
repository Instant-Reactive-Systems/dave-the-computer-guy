<script lang="ts">
    export let onSend: (name: string, description: string) => void;

    let name: string = "";
    let description: string = "";
</script>

<form on:submit|preventDefault>
    <input on:keydown|stopPropagation placeholder="Name" bind:value={name}/>
    <input on:keydown|stopPropagation placeholder="Description" bind:value={description}/>

    <button on:click={() => onSend(name, description)}>Save</button>
</form>

<style>

</style>


