import { RegisteredComponents } from '@mapples/types';

import { BottomNavigationBarSchematic } from './BottomNavigationBar/schematic';
import { BreadcrumbsSchematic } from './Breadcrumbs/schematic';
import { DrawerItemsSchematic } from './DrawerItems/schematic';
import { PageControlSchematic } from './PageControl/schematic';
import { StepsSchematic } from './Steps/schematic';
import { TabBarItemsSchematic } from './TabBarItems/schematic';
import { TabsSchematic } from './Tabs/schematic';
import { TextLinkSchematic } from './TextLink/schematic';
import { TopAppBarSchematic } from './TopAppBar/schematic';

/** Runtime registry of the navigation components. */
export const NavigationSchematics: RegisteredComponents = {
  [TopAppBarSchematic.type]: TopAppBarSchematic,
  [BottomNavigationBarSchematic.type]: BottomNavigationBarSchematic,
  [TabBarItemsSchematic.type]: TabBarItemsSchematic,
  [DrawerItemsSchematic.type]: DrawerItemsSchematic,
  [TabsSchematic.type]: TabsSchematic,
  [BreadcrumbsSchematic.type]: BreadcrumbsSchematic,
  [PageControlSchematic.type]: PageControlSchematic,
  [StepsSchematic.type]: StepsSchematic,
  [TextLinkSchematic.type]: TextLinkSchematic,
};
