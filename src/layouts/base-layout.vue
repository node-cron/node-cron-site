<template>
    <div>
        <menubar></menubar>
        <container>
            <slot></slot>
        </container>
    </div>
</template>

<script>
import Menubar from '../components/menubar.vue';
import Container from '../components/container.vue';

export default {
    components: {
        Menubar,
        Container
    }
}
</script>
