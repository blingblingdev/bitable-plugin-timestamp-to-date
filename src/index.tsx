import { Button, Checkbox, Select } from "@douyinfe/semi-ui";
import { OptionProps } from "@douyinfe/semi-ui/lib/es/select";
import {
  DateFormatter,
  FieldType,
  ITable,
  ToastType,
  bitable,
} from "@lark-base-open/js-sdk";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Colors from "./consts/Colors";
import Sizes from "./consts/Sizes";
import i18n from "./locales/i18n";
import { toast } from "./utils/toast";

const PAGE_SIZE = 5000;

/**
 * LoadApp component for converting timestamp fields in a table to date fields.
 * @component
 */
const LoadApp = () => {
  // State variables
  const [isReady, setIsReady] = useState(false);
  const [table, setTable] = useState<ITable | null>(null);
  const [fieldOptions, setFieldOptions] = useState<OptionProps[] | undefined>();
  const [selectedFieldOption, setSelectedFieldOption] = useState<
    OptionProps | undefined
  >();
  const [isMilliseconds, setIsMilliseconds] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the component
  useEffect(() => {
    /**
     * Fetches the active table and initializes field options.
     * @async
     */
    const f = async () => {
      // Fetch active table data asynchronously
      const table = await bitable.base.getActiveTable();
      setTable(table);
      const options: OptionProps[] = [];
      let fields = await table.getFieldListByType(FieldType.Text);
      for (const field of fields) {
        options.push({ value: field.id, label: await field.getName() });
      }
      fields = await table.getFieldListByType(FieldType.Number);
      for (const field of fields) {
        options.push({ value: field.id, label: await field.getName() });
      }
      setFieldOptions(options);
      setIsReady(true);
    };
    f();
  }, []);

  /**
   * Converts timestamp fields to date fields in the table.
   * @async
   */
  const convertTimestampToDate = useCallback(async () => {
    if (!selectedFieldOption || !table) {
      return;
    }
    setIsLoading(true);
    try {
      const fieldId = await table.addField({
        type: FieldType.DateTime,
        name: `${i18n.t("newFieldNamePrefix")}${
          selectedFieldOption.label
        } ${dayjs().toISOString()}`,
        property: { dateFormat: DateFormatter.DATE_TIME_WITH_HYPHEN },
      });
      const oldField = await table.getFieldById(
        selectedFieldOption.value as string
      );
      const newField = await table.getFieldById(fieldId);
      let pageToken: string | undefined = undefined;
      for (;;) {
        const { records, pageToken: newPageToken } = await table.getRecords({
          pageSize: PAGE_SIZE,
          pageToken,
        });
        for (const record of records) {
          let ts = await oldField.getCellString(record.recordId);
          if (!isMilliseconds) {
            ts += "000";
          }
          await newField.setValue(
            record.recordId,
            dayjs(parseInt(ts)).valueOf()
          );
        }
        pageToken = newPageToken;
        if (!pageToken) {
          break;
        }
      }
    } catch (err: any) {
      await toast({ message: err.message, toastType: ToastType.error });
    } finally {
      setIsLoading(false);
    }
  }, [isMilliseconds, selectedFieldOption, table]);

  // Render the main component
  return (
    <div style={styles.container}>
      <div style={styles.titleText}>{i18n.t("title")}</div>
      <div style={styles.selectorContainer}>
        <Select
          placeholder={
            isReady ? i18n.t("selectPlaceholder") : i18n.t("initializingText")
          }
          onChange={(value) => {
            setSelectedFieldOption(
              fieldOptions?.find((o) => o.value === value)
            );
          }}
          optionList={fieldOptions}
          disabled={!isReady}
          style={styles.selectorSelect}
        />
        <Checkbox
          checked={isMilliseconds}
          onChange={() => setIsMilliseconds(!isMilliseconds)}
          style={styles.selectorCheckbox}
        >
          {i18n.t("checkboxText")}
        </Checkbox>
      </div>
      <Button
        theme="solid"
        loading={isLoading}
        onClick={convertTimestampToDate}
      >
        {i18n.t("convertButtonText")}
      </Button>
      {i18n
        .t("note")
        .split("\n")
        .map((line) => (
          <div key={line} style={styles.noteText}>
            {line}
          </div>
        ))}
    </div>
  );
};

// Render the component to the root element
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>
);

interface StyleSheet {
  [key: string]: React.CSSProperties;
}

const styles: StyleSheet = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  titleText: {
    fontWeight: 800,
  },
  selectorContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorSelect: {
    flex: 1,
  },
  selectorCheckbox: {
    flexShrink: 0,
  },
  noteText: {
    fontSize: Sizes.small,
    color: Colors.slate500,
  },
};
