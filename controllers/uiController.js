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

export const getMenuForShortcuts = async (req, res) => {
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

    const menuItemsOutput = {
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
    };

    const formatLabels = (items, isCategory = false) => {
      // Check if the items array is empty
      if (items.length === 0) return [];

      // Define the output format for each item
      const itemOutput = "title: [TITLE]\nsub: [SUBTITLE]\nicon: [ICON]";

      // Otherwise, map through the items and format the labels
      // for the "Quick Menu" action from Toolbox Pro
      return items.map((item) => {
        return (
          itemOutput
            .replace("[TITLE]", item.name)
            .replace("[SUBTITLE]", item.timeElapsed)
            .replace("[ICON]", isCategory ? "📁" : item.emoji) + "\n"
        );
      });
    };

    const CATEGORY_LABELS = [];
    const ITEM_DATA = {};
    const UNCAT_LABELS = formatLabels(menuItemsOutput.uncategorized);
    const STARTED_LABELS = formatLabels(menuItemsOutput.started);

    for (const key in menuItemsOutput) {
      const thisItem = menuItemsOutput[key];

      if (
        key.toLowerCase() !== "started" &&
        key.toLowerCase() !== "uncategorized"
      ) {
        CATEGORY_LABELS.push(formatLabels(thisItem, true));

        // Add the category and it's items to the item data object
        ITEM_DATA[key] = thisItem;
      } else {
        // It's the "started" or "uncategorized" items
        thisItem.forEach((item) => {
          ITEM_DATA[item.name] = item;
        });
      }
    }

    const ALL_LABELS = [
      ...STARTED_LABELS,
      ...CATEGORY_LABELS,
      ...UNCAT_LABELS,
    ].join("\n");

    res.status(200).json({
      labels: ALL_LABELS,
      data: ITEM_DATA,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
