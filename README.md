##Hornet Pinpoint

This app is based on ionic framework for mobile support on both android and iOS. It uses triangulation techniques to pinpoint the position of any user sharing distance on hornet, connecting directly to hornet servers by reversing engineering the protocol, it uses a random annonymous hwid on every session to avoid possible blocks.

##Instalation

To sideload into iOS and android, first install nodejs, then install ionic and gulp with `npm -g ionic gulp`.

After checking out the sources, `npm install` and `gulp install` on the project root to install further dependencies.

Add the desired target platforms with `ionic platform add <platform name>`, in order to list available platforms enter `ionic platform`

In order to generate the apk perform `ionic build --release android`, provided that android sdk is previously installed.

For iOS building, do `ionic prepare ios` and navigate to `platforms/ios` to find the XCode project used to build and side load the app.

