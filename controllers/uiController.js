import { readAllActivityTypes } from "../models/activityTypeModel.js";
import { readAllCategories } from "../models/categoryModel.js";
import {
  processActivityTypes,
  processActivityTypesV2,
} from "../helpers/processActivityTypes.js";
import { sortByTimestamp } from "../helpers/sortByTimestamp.js";

const getRelatedActivityTypes = (types, category) => {
  return types.filter((type) => type.category === category);
};

export const getMenuItems = async (req, res) => {
  try {
    const CATEGORIES = await readAllCategories();
    const ACTIVITY_TYPES = await readAllActivityTypes();

    const categoriesItems = {};
    let startedMenuItems = [];
    let uncategorizedMenuItems = [];
    let menuItemIds = [];

    const menuItems = await Promise.all(
      CATEGORIES.map(async (category) => {
        const relatedActivityTypes = getRelatedActivityTypes(
          ACTIVITY_TYPES,
          category.name
        );

        const { activityTypes, started, uncategorized, itemIds } =
          await processActivityTypes(relatedActivityTypes, category.name);

        startedMenuItems = started.concat(startedMenuItems);
        uncategorizedMenuItems = uncategorized.concat(uncategorizedMenuItems);
        menuItemIds = itemIds.concat(menuItemIds);

        return {
          category: category.name,
          activityTypes,
        };
      })
    ); // End of Promise.all

    // Create an object with the category as the key and the activity types as an array of values
    menuItems.forEach((menuItem) => {
      // If the category is uncategorized, skip it
      if (menuItem.category === "Uncategorized") return;
      categoriesItems[menuItem.category] = menuItem.activityTypes
        // Filter out any activity types that don't have a name or timeElapsed (e.g. uncategorized items or started items)
        .filter((activityType) => activityType.name && activityType.timeElapsed)
        .map((activityType) => {
          return `${activityType.name} (${activityType.timeElapsed})`;
        });
    });

    res.status(200).json({
      started: startedMenuItems,
      ...categoriesItems,
      uncategorized: [
        ...uncategorizedMenuItems
          .filter((item) => item.timestamp === 0)
          .map((item) => `${item.name} (${item.timeElapsed})`),
        ...uncategorizedMenuItems
          .filter((item) => item.timestamp !== 0)
          .sort(sortByTimestamp)
          .map((item) => `${item.name} (${item.timeElapsed})`),
      ],
      ids: menuItemIds,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getMenuItemsV2 = async (req, res) => {
  try {
    const CATEGORIES = await readAllCategories();
    const ACTIVITY_TYPES = await readAllActivityTypes();

    const categoriesItems = {};
    let startedMenuItems = [];
    let uncategorizedMenuItems = [];

    const menuItems = await Promise.all(
      CATEGORIES.map(async (category) => {
        const relatedActivityTypes = getRelatedActivityTypes(
          ACTIVITY_TYPES,
          category.name
        );

        const { activityTypes, started, uncategorized } =
          await processActivityTypesV2(relatedActivityTypes, category.name);

        startedMenuItems = started.concat(startedMenuItems);
        uncategorizedMenuItems = uncategorized.concat(uncategorizedMenuItems);

        return {
          category: category.name,
          activityTypes,
        };
      })
    ); // End of Promise.all

    // Create an object with the category as the key and the activity types as an array of values
    menuItems.forEach((menuItem) => {
      // If the category is uncategorized, skip it
      if (menuItem.category === "Uncategorized") return;
      categoriesItems[menuItem.category] = menuItem.activityTypes
        // Filter out any activity types that don't have a name or timeElapsed (e.g. uncategorized items or started items)
        .filter((activityType) => activityType.name && activityType.timeElapsed)
        .map((item) => {
          return {
            type_id: item.type_id,
            name: item.name,
            timestamp: item.timestamp,
            timeElapsed: item.timeElapsed,
            status: item.status || "none",
            emoji: item.emoji,
          };
        });
    });

    res.status(200).json({
      started: startedMenuItems.sort(sortByTimestamp),
      ...categoriesItems,
      uncategorized: [
        ...uncategorizedMenuItems
          .filter((item) => item.timestamp === 0)
          .map((item) => {
            return {
              type_id: item.type_id,
              name: item.name,
              timestamp: item.timestamp,
              timeElapsed: item.timeElapsed,
              status: "none",
              emoji: item.emoji,
            };
          }),
        ...uncategorizedMenuItems
          .filter((item) => item.timestamp !== 0)
          .sort(sortByTimestamp)
          .map((item) => {
            return {
              type_id: item.type_id,
              name: item.name,
              timestamp: item.timestamp,
              timeElapsed: item.timeElapsed,
              status: "none",
              emoji: item.emoji,
            };
          }),
      ],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
