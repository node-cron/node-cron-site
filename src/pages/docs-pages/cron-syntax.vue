<template>
       <div>
        <h2>Cron Syntax</h2>
        <p>
            This is a quick reference to cron syntax and also shows the options supported by node-cron.
        </p>
        <h3>Allowed fields</h3>
        <pre>
            <code>
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *
            </code>
        </pre>

        <h3>Allowed values</h3>
        <table>
            <thead>
                <tr>
                    <th>fields</th>
                    <th>values</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>second</td>
                    <td>0-59</td>
                </tr>
                <tr>
                    <td>minute</td>
                    <td>0-59</td>
                </tr>
                <tr>
                    <td>hour</td>
                    <td>0-23</td>
                </tr>
                <tr>
                    <td>day of month</td>
                    <td>1-31</td>
                </tr>
                <tr>
                    <td>month</td>
                    <td>1-12 (or names, e.g: Jan, Feb, March, April)</td>
                </tr>
                <tr>
                    <td>day of week</td>
                    <td>0-7 (0 or 7 are sunday, or names, e.g. Sunday, Monday, Tue, Wed)</td>
                </tr>
            </tbody>
        </table>

        <h3>Using multiples values</h3>
        You may use multiples values separated by comma:

        <js-code>
var cron = require('node-cron');

cron.schedule('1,2,4,5 * * * *', () => {
    console.log('running every minute 1, 2, 4 and 5');
});
        </js-code>

        <h3>Using ranges</h3>
        You may also define a range of values:

        <js-code>
var cron = require('node-cron');

cron.schedule('1-5 * * * *', () => {
  console.log('running every minute to 1 from 5');
});
        </js-code>

        <h3>Using step values</h3>
        Step values can be used in conjunction with ranges, following a range with '/' and a number. e.g: 1-10/2 that is the same as 2,4,6,8,10. Steps are also permitted after an asterisk, so if you want to say “every two minutes”, just use */2.
        <js-code>
var cron = require('node-cron');

cron.schedule('*/2 * * * *', () => {
  console.log('running a task every two minutes');
});
        </js-code>

        <h3>Using names</h3>
        For month and week day you also may use names or short names. e.g:
        <js-code>
var cron = require('node-cron');

cron.schedule('* * * January,September Sunday', () => {
  console.log('running on Sundays of January and September');
});
        </js-code>

        Or with short names:
        <js-code>
var cron = require('node-cron');

cron.schedule('* * * Jan,Sep Sun', () => {
  console.log('running on Sundays of January and September');
});
        </js-code>
    </div>
</template>

<script>
import JsCode from '../../components/js-code.vue'

export default {
    components: {
        JsCode
    }
}
</script>
