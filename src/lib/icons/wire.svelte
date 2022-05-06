<script lang="ts">
    export let color: string = '#000';
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path stroke={color} d="M4 20L20 4"/>
    <circle vector-effect='non-scaling-stroke' cx='6' cy='18' r='2' fill={color}/>
    <circle vector-effect='non-scaling-stroke' cx='18' cy='6' r='2' fill={color}/>
</svg>

