## Local Development

This section contains information about how to run, test and develop `sb-migrate` locally. If you want to contribute to the project, please read the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines first.

### Clone the repository

```bash
git clone https://github.com/jungvonmatt/storyblok-migrations.git
cd storyblok-migrations
```

### Install dependencies

```bash
pnpm install
```

### Build the project

```bash
pnpm build
```

#### Optional: Watch mode for development

If you want to run the project in watch mode instead of building it, you can use the following command:

```bash
pnpm dev
```

### Link to global to test package locally

1. Link the package globally

```bash
pnpm link -g
```

2. Now you can use the package in any project locally by running the following command:

```bash
sb-migrate
```

3. Optional: Unlink the package when done

```bash
pnpm unlink -g
```

4. Optional: Pack the package and install it locally in a repository.

```bash
pnpm pack
```

5. Optional: Install the package in a repository

```bash
pnpm install path/to/package.tgz
```

### Configuration

Make sure to configure Storyblok before testing the package locally. Please refer to the [CONFIGURATION](README.md#configuration) section in the README.

### Testing

#### Run tests

```bash
pnpm test
```

#### Tests when committing

This project uses [Husky](https://typicode.github.io/husky/#/) to run all tests automatically when committing. Please refer to the [Husky](https://typicode.github.io/husky/#/) documentation for more information.
