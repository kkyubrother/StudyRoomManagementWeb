import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import Stack from "react-bootstrap/Stack";
import { useEffect, useState } from "react";
import { getDepartments } from "../../api/departments";
// import {getDepartments} from "../../api/departments";

const REGION_INITIAL_STATE = "지역을 선택하세요";
const REGION_TYPE = {
  etc: {
    key: "etc",
    name: "기타",
    variation: [""],
    regex: /.+/,
  },
};

const DepartmentDropdownSelectorComponent = ({
  region = REGION_INITIAL_STATE,
  setRegion,
  regionTypePreset = "지역 분류",
  disabled = false,
}) => {
  const [departments, setDepartments] = useState([]);

  const [regionEtc, setRegionEtc] = useState([]);
  const [regionType, setRegionType] = useState(regionTypePreset);

  const regionName = (key) => {
    if (key === REGION_INITIAL_STATE) return key;
    else if (key === null) return REGION_INITIAL_STATE;
    if (departments.length <= 0) return key;
    else {
      let search = departments.filter((value) => value.key === key);
      if (search && search.length > 0) return search[0].name;
      else {
        search = departments.filter((value) => value.variation.includes(key));
        if (search && search.length > 0) return search[0].name;
        return key;
      }
    }
  };

  const handleOnClickRegionType = (region_type_key) => {
    setRegionType(region_type_key);
  };

  useEffect(() => {
    getDepartments().then((result) => {
      setDepartments(result);

      setRegionEtc(
        result.map((value) => (
          <Dropdown.Item key={value.key} onClick={() => setRegion(value.key)}>
            {value.name}
          </Dropdown.Item>
        )),
      );
    });
  }, []);

  return (
    <Stack direction="horizontal" gap={3}>
      <DropdownButton
        variant="outline-primary"
        title={
          REGION_TYPE[regionType] ? REGION_TYPE[regionType].name : regionType
        }
        id="input-group-dropdown-regionType"
        disabled={disabled}
      >
        {
          <Dropdown.Item
            key={REGION_TYPE.etc.name}
            onClick={() => handleOnClickRegionType(REGION_TYPE.etc.key)}
          >
            {REGION_TYPE.etc.name}
          </Dropdown.Item>
        }
      </DropdownButton>
      <DropdownButton
        variant="outline-secondary"
        title={regionName(region)}
        id="input-group-dropdown-PayTypeComponent"
        disabled={disabled || !REGION_TYPE[regionType]}
      >
        {regionType === REGION_TYPE.etc.key ? regionEtc : null}
      </DropdownButton>
    </Stack>
  );
};

export default DepartmentDropdownSelectorComponent;
