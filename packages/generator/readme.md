# Generator

This package contains all shared logic for the Coffee Generator CLi tool and Visual Studio Code extension.

## Usage

This package contains 4 main methods:

### 1. generate

This method adds the specified components from their respective repository to the specified output folder. If no output folder is provided, the current working directory will be used.

Example:

```typescript
console.log('Generating compoonents');

await generate(canOverwriteFile, 'react-native', ['button', 'modal.tsx'], '/Users/username/Desktop');

console.log('Done generating components')

async function canOverwriteFile(platform: string, component: string, status: ComponentStatus) {
  // This function is called when a file already exists in the output folder. If you return true, the file will be overwritten.
  
  console.log(`Do you want to overwrite the file ${component}?`);
  const userInput = await receiveInput();
  return userInput === 'yes';
}
```

### 2. getPlatformsList
This method returns a list of available platforms.

Example:

```typescript
const platforms = await getPlatformsList();

console.log(platforms);
```

### 3. getAllAvailableComponents

This method returns an object of all available platforms with their respective components.

Example:

```typescript
const platforms = await getAllAvailableComponents();

Object.keys(platforms).forEach(platform => {
  console.log(`Platform ${platform.name} has the following components:`);
  console.log(platform.components[0].name);
})
```

If parameter `platform` is supplied, output will look like the following:

```typescript
const components = await getComponents('React-Native');
console.log(components[0].name)
```

### 4. getAvailableComponentsForPlatform
This method returns all available components for a specific platform.

Example:

```typescript
const components = getAvailableComponentsForPlatform('react-native');
console.log(components[0].name)
```

### 5. getAvailableGroups
Returns a list of repository groups that are accessible by the user.

### 5. logout

Removes saved tokens from your OS's password store (MacOS: Keychain, Linux: Secret Service API/libsecret, Windows: Credential Vault)

### 6. configureRepo
Sets the repository ID and branch name

### 7. configureClientId
Sets the client ID

## Authentication

This tool communicates with the Gitlab API (version 4). Authentication is done according to the Oauth2 spec. The process is as follows when a request to the GitLab API is made:

1. The app tries to extract a saved token from memory or the OS-specific token storage.
2. If no saved token is found, the subjects `shouldOpenBrowser` and `authenticationStartSubject` will be notified
3. In the callback that you attached to the `shouldOpenBrowser` subject, you will receive a url parameter. You must open a browser with that url.
4. The user will be asked for their permission. If granted (or denied), this application will be notified and notify `authenticationSuccessSubject`. If denied, it will throw an error of type `TokenError`.
5. The app will store the received token in the OS-specific token storage and in memory.

### GitLab setup

In GitLab, navigate to 'settings/applications'. Enter a name for the application in the 'name'. In the field 'Redirect URI' enter the following: `http://127.0.0.1:8123/oauth`.
Tick the box before 'api' in the 'scopes' list and make sure that the other scope boxes are unticked.

Click on 'Save application' and add the client Id & client secret to your environment variables.

## Events

You can subscribe to the following events:

- `authenticationStartSubject` - Notified when a user needs to authenticate themselves
- `authenticationSuccessSubject` - Notified when authentication was successful
- `shouldOpenBrowser` - Notified when a browser needs to be opened
- `componentProcessedSubject` - Notified when a component is processed in the generator method.