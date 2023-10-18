# Material Icons' Subsetting

This directory holds Material Icons used within OCW websites.

We subset material icons' fonts to make them smaller for delivery. By "subsetting a font" we simply mean removing unnecessary characters from the font face.

Each time the set of icons changes, new subset font assets must be created. To do so, read the following sections.

## Prerequisites

* You must have the dependencies from the main project installed.

* Install [fonttools](https://github.com/fonttools/fonttools) utility.


  Ubuntu
  ```bash
  sudo apt-get install -y fonttools
  ```

  MacOS
  ```zsh
  brew install fonttools
  ```

## Adding a new icon

To add a new icon, follow these steps:

1. Identify the name of the icon you want to use.
   > You may explore the icons [here](https://fonts.google.com/icons).
2. Search the codepoint for the icon in [./MaterialIcons-Regular.codepoints](./MaterialIcons-Regular.codepoints) or [./MaterialIconsRound-Regular.codepoints](./MaterialIconsRound-Regular.codepoints).
3. Copy the codepoint declaration line.
4. Paste the codepoint declaration line in [./MaterialIcons-Regular.subset.codepoints](./MaterialIcons-Regular.subset.codepoints) or [./MaterialIconsRound-Regular.subset.codepoints](./MaterialIconsRound-Regular.subset.codepoints), wherever appropriate.
5. Run
   ```zsh
   yarn subset-fonts
   ```
6. Commit the new assets.

## Removing an icon

To remove an icon, follow these steps:

1. Identify the name of the icon you want to remove.
   > You may explore the icons [here](https://fonts.google.com/icons).
2. Remove the codepoint declaration line in [./MaterialIcons-Regular.subset.codepoints](./MaterialIcons-Regular.subset.codepoints) or [./MaterialIconsRound-Regular.subset.codepoints](./MaterialIconsRound-Regular.subset.codepoints), wherever appropriate.
3. Run
   ```zsh
   yarn subset-fonts
   ```
4. Commit the new assets.

## `subset-fonts` command

To get the latest information on this command and its arguments, run

```zsh
yarn subset-fonts --help
```
