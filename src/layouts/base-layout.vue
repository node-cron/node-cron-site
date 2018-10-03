<template>
    <div>
        <topbar></topbar>
        <slot></slot>
    </div>
</template>

<script>
import Topbar from '../components/topbar.vue';

export default {
    components: {
        Topbar
    }
}
</script>
