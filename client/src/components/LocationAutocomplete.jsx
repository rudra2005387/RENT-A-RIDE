import { useState, useEffect, useCallback } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { searchLocations } from "../utils/locationService";

/**
 * LocationAutocomplete Component
 * Searchable location input with debouncing and API integration
 * 
 * Props:
 * - label: Label for the input
 * - value: Current selected location
 * - onChange: Callback when location is selected (receives { name, lat, lng, district, label, value })
 * - placeholder: Placeholder text
 * - error: Boolean for error state
 * - helperText: Helper text to display
 * - required: Boolean for required field
 * - icon: React component for icon
 */
const LocationAutocomplete = ({
  label,
  value,
  onChange,
  placeholder = "Search location...",
  error = false,
  helperText = "",
  required = false,
  icon: IconComponent = null,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchLocations(searchQuery, 10);
      setOptions(results);
    } catch (error) {
      console.error("Location search error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(inputValue);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [inputValue, performSearch]);

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event, newValue) => {
    if (newValue) {
      onChange({
        name: newValue.name,
        lat: newValue.lat,
        lng: newValue.lng,
        district: newValue.district,
        label: newValue.label,
        value: newValue.value,
      });
    } else {
      onChange(null);
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, val) => option.value === val?.value}
      getOptionLabel={(option) => option.label || ""}
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      value={value || null}
      disabled={disabled}
      freeSolo={false}
      noOptionsText="No locations found"
      loadingText="Searching locations..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {IconComponent && (
                  <span style={{ marginRight: "8px", display: "flex", alignItems: "center" }}>
                    <IconComponent size={20} />
                  </span>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div style={{ width: "100%" }}>
            <div style={{ fontWeight: 500 }}>{option.name}</div>
            <div style={{ fontSize: "0.85em", color: "#666" }}>
              {option.district}
              {option.region && ` • ${option.region}`}
            </div>
          </div>
        </li>
      )}
      sx={{
        "& .MuiOutlinedInput-root": {
          padding: "8px 12px",
        },
        "& .MuiAutocomplete-listbox": {
          maxHeight: "300px",
        },
      }}
    />
  );
};

export default LocationAutocomplete;
