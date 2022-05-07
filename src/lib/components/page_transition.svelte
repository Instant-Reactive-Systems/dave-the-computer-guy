<script>
    import { blur } from 'svelte/transition';
    export let refresh = '';
    $:{
        console.log(refresh);
    }
  </script>
  
  {#key refresh}
    <div
      in:blur="{{duration: 500, amount: 1000}}"
      >
      <slot/>
    </div>
  {/key}
  