/* eslint-disable promise/no-nesting */
'use strict'

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.firestore.document('/Users/{user_id}/Notifications/{notification_id}').onWrite((data, context) => {

    const user_id = context.params.user_id;
    const notification_id = context.params.notification_id;

    return admin.firestore().collection("Users").doc(user_id).collection("Notifications").doc(notification_id).get().then(response => {

        const from_user_id = response.data().from;
        const from_message = response.data().message;
        // console.log(from_user_id);

        const from_data = admin.firestore().collection("Users").doc(from_user_id).get();
        const to_data = admin.firestore().collection("Users").doc(user_id).get();
        // const message = admin.firestore().doc('/Users/{user_id}/Notifications/{notification_id}/').onSnapshot();
        // console.log(message);


        // eslint-disable-next-line promise/no-nesting
        return Promise.all([from_data, to_data]).then(result => {

            const from_name = result[0].data().name;
            const to_name = result[1].data().name;
            const token_id = result[1].data().token_id;


            //  eslint-disable-next-line no-unreachable
            // const message = admin.database().ref(`/Users/{user_id}/Notifications/{notification_id}/message`).once('value');


            const payload = {
                notification: {
                    title: from_name,
                    body: from_message,
                    icon: "default",
                    click_action: "in.tvac.akshaye.lapitchat_TARGET_NOTIFICATION"
                },
                data: {
                    from_user_id: from_user_id
                }
            };

            // eslint-disable-next-line promise/always-return
            return admin.messaging().sendToDevice(token_id, payload).then(result => {
                console.log("Notification Send.");

            });
        });
    });
});

