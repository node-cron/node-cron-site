<template>
    <div>
        <h2>Getting Started</h2>
        <p>
            Install node-cron using npm:
            <span class="code-inline">$ npm install --save node-cron</span>
        </p>
        <p>
            Import node-cron and schedule a task:
            <js-code>
var cron = require('node-cron');

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
});
            </js-code> 
        </p>
    </div>
</template>

<script>
import JsCode from '../../components/js-code.vue';

export default {
    components: {
        JsCode
    }
}
</script>
