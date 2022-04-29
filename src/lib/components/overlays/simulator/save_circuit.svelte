<script lang="ts">
    export let onSend: (name: string, description: string) => void;

    let name: string;
    let description: string;
</script>

<form>
    <label>Name: <input type="text" bind:value={name}/></label>
    <label>Description: <input type="text" bind:value={description}/></label>

    <button on:click={() => onSend(name, description)}>Save</button>
</form>

<style>

</style>


