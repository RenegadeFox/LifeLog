import {
  readAllActivityTypes,
  readActivityTypesByCategory,
} from "../models/activityTypeModel.js";
import { readLastActivityByType } from "../models/activityModel.js";
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
    // Will hold all of the activities that have been started
    const STARTED_ITEMS = [];
    // Will hold all of the activities that are uncategorized
    const UNCAT_ITEMS = await readActivityTypesByCategory(2);
    // Get all categories, excluding the "Uncategorized" category
    const ALL_CATEGORIES = await readAllCategories();

    const categoriesAndItems = await Promise.all(
      ALL_CATEGORIES.filter(
        (cat) => cat.name.toLowerCase() !== "uncategorized"
      ).map(async (category) => {
        // Get all activity types for the current category
        const activityTypes = await readActivityTypesByCategory(category.id);

        // For each activity type, get the last activity of that type
        const lastActivities = await Promise.all(
          activityTypes.map(async (type) => {
            const lastActivity = await readLastActivityByType(type.id);
            if (!lastActivity) {
              return {
                id: type.id,
                activity_type: type.name,
                type_id: type.id,
                start_label: type.start_label,
                end_label: type.end_label,
                status: type.toggle ? "not-started" : "none",
                description: "",
                timestamp: 0,
                category: category.name,
                category_id: category.id,
                emoji: type.emoji,
              };
            }

            if (lastActivity.toggle) {
              lastActivity.label =
                lastActivity.status === "started"
                  ? type.end_label
                  : type.start_label;
            } else {
              lastActivity.label = lastActivity.name;
            }

            return lastActivity;
          })
        );

        return {
          id: category.id,
          category: category.name,
          lastActivities: lastActivities,
        };
      })
    );

    categoriesAndItems.forEach((item) => {
      item.lastActivities.forEach((activity) => {
        if (!activity) return;

        if (activity.status === "started") {
          activity.label = activity.end_label;
          STARTED_ITEMS.push(activity);
          return;
        }
      });
    });

    res.status(200).json({
      started: STARTED_ITEMS,
      categories: categoriesAndItems,
      uncategorized: UNCAT_ITEMS.map((item) => {
        item.label = item.name;
        return item;
      }),
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getMenuForShortcuts = async (req, res) => {
  try {
    const CATEGORIES = await readAllCategories();
    const ACTIVITY_TYPES = await readAllActivityTypes();

    let startedMenuItems = [];
    let uncategorizedMenuItems = [];
    const CATEGORY_ITEMS = {};
    const ITEM_DATA = {};
    const CATEGORY_LABELS = [];

    const formatLabel = ({ name, subtitle, icon }) => {
      // Define the output format for each item
      const itemOutput = "title: [TITLE]\nsub: [SUBTITLE]\nicon: [ICON]";

      return (
        itemOutput
          .replace("[TITLE]", name)
          .replace("[SUBTITLE]", subtitle)
          .replace("[ICON]", icon) + "\n"
      );
    };

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
      CATEGORY_ITEMS[menuItem.category] = menuItem.activityTypes
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

    const STARTED_ITEMS = startedMenuItems.sort(sortByTimestamp);
    const UNCAT_ITEMS = [
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
    ];
    const STARTED_LABELS = STARTED_ITEMS.map((item) => {
      return formatLabel({
        name: item.name,
        subtitle: item.timeElapsed,
        icon: item.emoji,
      });
    });
    const UNCAT_LABELS = UNCAT_ITEMS.map((item) => {
      return formatLabel({
        name: item.name,
        subtitle: item.timeElapsed,
        icon: item.emoji,
      });
    });

    const ALL_ITEMS = {
      started: STARTED_ITEMS,
      ...CATEGORY_ITEMS,
      uncategorized: UNCAT_ITEMS,
    };

    for (const key in ALL_ITEMS) {
      const thisItem = ALL_ITEMS[key];

      if (
        key.toLowerCase() !== "started" &&
        key.toLowerCase() !== "uncategorized"
      ) {
        CATEGORY_LABELS.push(
          formatLabel({
            name: key,
            subtitle: `${thisItem.length} activities`,
            icon: "📂",
          })
        );

        // Format the data object so the key is the category name
        // and the value is the items in that formatted the same
        const formattedSubItems = {};

        thisItem.forEach((subItem) => {
          formattedSubItems[subItem.name] = {
            ...subItem,
            isCategory: false,
          };
        });

        // Add the category and it's items to the item data object
        ITEM_DATA[key] = {
          isCategory: true,
          labels: thisItem
            .map((subItem) =>
              formatLabel({
                name: subItem.name,
                subtitle: subItem.timeElapsed,
                icon: subItem.emoji,
              })
            )
            .join("\n"),
          data: formattedSubItems,
        };
      } else {
        // It's the "started" or "uncategorized" items
        thisItem.forEach((item) => {
          item.isCategory = false;
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
