<script>
    import { blur } from 'svelte/transition';
    export let refresh = '';
    $:{
        console.log(refresh);
    }
  </script>
  
  {#key refresh}
    <div
      in:blur="{{duration: 2500, amount: 1000}}"
      out:blur="{{ duration: 2500 }}" 
      >
      <slot/>
    </div>
  {/key}
  