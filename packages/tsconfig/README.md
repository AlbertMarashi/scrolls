# @siteforge/tsconfig

Shared TypeScript configuration for SiteForge packages.

## Usage

```json
{
  "extends": "@siteforge/tsconfig/base.json",
  "compilerOptions": {
    // Your package-specific options here
  },
}
```

## Available Configurations

- `base.json`: The base configuration for most packages

## Maintenance

When updating this configuration, consider the impact on all packages using it.
