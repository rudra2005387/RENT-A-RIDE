import { IconCalendarEvent, IconMapPinFilled, IconX } from "@tabler/icons-react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";

//reducers
import { setAvailableCars } from "../../redux/user/selectRideSlice";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { setSelectedData } from "../../redux/user/BookingDataSlice";
import dayjs from "dayjs";
import useFetchLocationsLov from "../../hooks/useFetchLocationsLov";
import LocationAutocomplete from "../../components/LocationAutocomplete";

const schema = z.object({
  dropoff_location: z.object({
    name: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
    district: z.string(),
    label: z.string(),
    value: z.string(),
  }, { message: "Dropoff location needed" }),
  
  pickup_location: z.object({
    name: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
    district: z.string(),
    label: z.string(),
    value: z.string(),
  }, { message: "Pickup Location needed" }),

  pickuptime: z.object({
    $d: z.instanceof(Date).refine((date) => date !== null && date !== undefined, {
      message: "Date is not selected",
    }),
  }),

  dropofftime: z.object(
    {
      $L: z.string(), // Language code
      $d: z.date(), // Date object
      $y: z.number(), // Year
      $M: z.number(), // Month (0-indexed)
      $D: z.number(), // Day of month
      $W: z.number(), // Day of week (0-indexed, starting from Sunday)
      $H: z.number(), // Hour
      $m: z.number(), // Minute
      $s: z.number(), // Second
      $ms: z.number(), // Millisecond
      $isDayjsObject: z.boolean(), // Indicator for Day.js object
    },
    { message: "drop-off time is required" }
  ),
}).refine(
  (data) => {
    // Validate that dropoff date is after pickup date
    const pickupDate = data.pickuptime?.$d;
    const dropoffDate = data.dropofftime?.$d;
    
    if (pickupDate && dropoffDate) {
      return dropoffDate > pickupDate;
    }
    return true;
  },
  {
    message: "Drop-off date must be after pick-up date",
    path: ["dropofftime"],
  }
);

const CarSearch = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_location: null,
      dropoff_location: null,
      pickuptime: null,
      dropofftime: null,
    },
  });

  const navigate = useNavigate();
  const { fetchLov, isLoading } = useFetchLocationsLov();

  const [pickup, setPickup] = useState(null);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  const dispatch = useDispatch();

  //useEffect to fetch data from backend for locations
  useEffect(() => {
    fetchLov();
  }, []);

  //search cars
  const hanldeData = async (data) => {
    try {
      if (data && pickupLocation && dropoffLocation) {
        const pickupDate = data.pickuptime.$d;
        const dropOffDate = data.dropofftime.$d;
        
        // Additional validation - ensure pickup date is before dropoff date
        if (pickupDate >= dropOffDate) {
          setError("Drop-off date and time must be after pick-up date and time");
          return;
        }
        
        // Preserve the selected data for later use
        dispatch(setSelectedData({
          ...data,
          pickup_location_details: pickupLocation,
          dropoff_location_details: dropoffLocation,
        }));
        
        const datas = {
          pickupDate,
          dropOffDate,
          pickUpLocation: pickupLocation.name,
          pickUpDistrict: pickupLocation.district,
          dropOffLocation: dropoffLocation.name,
          dropOffDistrict: dropoffLocation.district,
          // Include coordinates for distance calculation
          pickupCoords: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng,
          },
          dropoffCoords: {
            lat: dropoffLocation.lat,
            lng: dropoffLocation.lng,
          },
        };

        const res = await fetch("api/user/showSingleofSameModel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datas),
        });

        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.message || "Error searching for vehicles");
          return;
        }

        if (res.ok) {
          const result = await res.json();
          dispatch(setAvailableCars(result));
          navigate("/availableVehicles");
        }

        if (res.ok) {
          reset({
            pickuptime: null,
            dropofftime: null,
            pickup_location: null,
            dropoff_location: null,
          });
          setPickupLocation(null);
          setDropoffLocation(null);
        }
      } else {
        setError("Please select both pickup and dropoff locations");
      }
    } catch (error) {
      console.log("Error  : ", error);
      setError("An error occurred. Please try again.");
    }
  };

  //this is to ensure there will be 1 day gap between pickup and dropoff date
  const oneDayGap = pickup && pickup.add(1, "day");

  return (
    <>
      <section id="booking-section" className="book-section relative z-10 mt-[50px]  mx-auto max-w-[1500px] bg-white">
        {/* overlay */}

        <div className="container bg-white">
          <div className="book-content   ">
            <div className="book-content__box ">
              <h2>Book a car</h2>

              <p className="error-message">
                All fields required! <IconX width={20} height={20} />
              </p>

              <p className="booking-done">
                Check your email to confirm an order. <IconX width={20} height={20} />
              </p>

              <form onSubmit={handleSubmit(hanldeData)}>
                <div className="box-form">
                  {/* Pickup Location with Autocomplete */}
                  <div className="box-form__car-type">
                    <label htmlFor="pickup_location" className="flex items-center">
                      <IconMapPinFilled className="input-icon" /> &nbsp; Pick-up Location <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="pickup_location"
                      control={control}
                      render={({ field }) => (
                        <LocationAutocomplete
                          label="Pickup Location"
                          placeholder="Search for pickup location..."
                          value={pickupLocation}
                          onChange={(location) => {
                            setPickupLocation(location);
                            field.onChange(location);
                          }}
                          error={Boolean(errors.pickup_location)}
                          helperText={errors.pickup_location?.message}
                          required
                          icon={IconMapPinFilled}
                        />
                      )}
                    />
                  </div>

                  {/* Dropoff Location with Autocomplete */}
                  <div className="box-form__car-type">
                    <label htmlFor="dropoff_location" className="flex items-center">
                      <IconMapPinFilled className="input-icon" /> &nbsp; Drop-off Location <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="dropoff_location"
                      control={control}
                      render={({ field }) => (
                        <LocationAutocomplete
                          label="Dropoff Location"
                          placeholder="Search for dropoff location..."
                          value={dropoffLocation}
                          onChange={(location) => {
                            setDropoffLocation(location);
                            field.onChange(location);
                          }}
                          error={Boolean(errors.dropoff_location)}
                          helperText={errors.dropoff_location?.message}
                          required
                          icon={IconMapPinFilled}
                        />
                      )}
                    />
                  </div>

                  <div className="box-form__car-time">
                    <label htmlFor="picktime" className="flex items-center">
                      <IconCalendarEvent className="input-icon" /> &nbsp; Pick-up Date <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name={"pickuptime"}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateTimePicker"]}>
                            <DateTimePicker
                              label="Pickup time"
                              {...field}
                              value={field.value}
                              minDate={dayjs()}
                              onChange={(newValue) => {
                                field.onChange(newValue); // Update the form field value
                                setPickup(newValue); // Update the pickup state
                              }}
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      )}
                    />
                    {errors.pickuptime && <p className="text-red-500">{errors.pickuptime.message}</p>}
                  </div>

                  <div className="box-form__car-time">
                    <label htmlFor="droptime" className="flex items-center">
                      <IconCalendarEvent className="input-icon" /> &nbsp; Drop-of Date <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name={"dropofftime"}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateTimePicker"]}>
                            <DateTimePicker label="Dropoff time" {...field} value={field.value} minDate={pickup ? oneDayGap : dayjs()} />
                          </DemoContainer>
                        </LocalizationProvider>
                      )}
                    />
                    {errors.dropofftime && <p className="text-red-500">{errors.dropofftime.message}</p>}
                    {error && <p className="text-[8px] text-red-500">{error}</p>}
                  </div>

                  <button type="submit" className="book-content__box_button">
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CarSearch;
