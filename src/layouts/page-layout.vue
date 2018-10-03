<template>
    <base-layout>
        <div>
            <slot></slot>
        </div>
    </base-layout>
</template>

<script>
import BaseLayout from './base-layout.vue';
export default {
    components: {
        BaseLayout
    }
}
</script>
