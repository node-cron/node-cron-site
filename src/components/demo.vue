<template>
    <div class="demo">
        <div class="demo-container">
        </div>
    </div>
</template>

<script>
    import GDemo from '@glorious/demo';
    import Prism from 'prismjs';

    import '@glorious/demo/dist/gdemo.min.css';
    import 'prismjs/themes/prism-tomorrow.css';

    export default {
         mounted(){
            this.play();
        },
        methods: {
            play: function () {   
                const demo = new GDemo('.demo-container');

                const code = `
const cron = require('node-cron');

cron.schedule('* * * * * *', function () {
    console.log('running a task every second!')
});
`
                const highlightedCode = Prism.highlight(
                    code,
                    Prism.languages.javascript,
                    'javascript'
                );

                demo.openApp('editor', {minHeight: '350px', windowTitle: 'cron.js'})
                .write(highlightedCode, {onCompleteDelay: 1500})
                .openApp('terminal', {minHeight: '350px', promptString: '$'})
                .command('node ./cron.js', {onCompleteDelay: 500})
                .respond('running a task every second!', {onCompleteDelay: 1000})
                .respond('running a task every second!', {onCompleteDelay: 1000})
                .respond('running a task every second!', {onCompleteDelay: 1000})
                .respond('running a task every second!', {onCompleteDelay: 1000})
                .respond('running a task every second!', {onCompleteDelay: 1000})
                .respond('^C')
                .command('')
                .end();
            }
        }
    }
</script>

<style lang="scss">
    .demo {
        text-align: center;
        margin-top: 80px;
        height: 400px;

        .demo-container {
            text-align: left;
            width: 95%;
            margin-left: auto;
            margin-right: auto;
            margin-top: 40px;
        }
    }
</style>


