<script>
    export let value = '';
    export let placeholder;
    export let label;
    export let name;
    export let id;
  </script>
  
  <label for={id}>{label}</label>
  <p>HEllo</p>
  <input bind:value {placeholder} {id} {name} type="text" />
  