import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Province, City } from "../lib/location-service";
import ProvinceForm from "./ProvinceForm";
import CityForm from "./CityForm";

interface DialogControl<T> {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isSubmitting: boolean;
  selected?: T | null;
}

interface LocationDialogsProps {
  provinces: Province[];
  dialogs: {
    provinces: {
      add: DialogControl<Province>;
      edit: DialogControl<Province>;
    };
    cities: {
      add: DialogControl<City>;
      edit: DialogControl<City>;
    };
  };
  onAddProvince: (data: { name: string; active: boolean }) => Promise<void>;
  onUpdateProvince: (data: { name: string; active: boolean }) => Promise<void>;
  onAddCity: (data: { name: string; provinceId: string; active: boolean }) => Promise<void>;
  onUpdateCity: (data: { name: string; provinceId: string; active: boolean }) => Promise<void>;
}

export default function LocationDialogs({
  provinces,
  dialogs,
  onAddProvince,
  onUpdateProvince,
  onAddCity,
  onUpdateCity
}: LocationDialogsProps) {
  return (
    <div className="flex gap-2">
      {/* Add Province Dialog */}
      <Dialog 
        open={dialogs.provinces.add.isOpen} 
        onOpenChange={dialogs.provinces.add.setOpen}
      >
        <DialogTrigger asChild>
          <Button 
            onClick={() => dialogs.provinces.add.setOpen(true)} 
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Province
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Province</DialogTitle>
            <DialogDescription>
              Add a new province/state to the system.
            </DialogDescription>
          </DialogHeader>
          
          <ProvinceForm
            onSubmit={onAddProvince}
            onCancel={() => dialogs.provinces.add.setOpen(false)}
            isSubmitting={dialogs.provinces.add.isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add City Dialog */}
      <Dialog 
        open={dialogs.cities.add.isOpen} 
        onOpenChange={dialogs.cities.add.setOpen}
      >
        <DialogTrigger asChild>
          <Button 
            onClick={() => dialogs.cities.add.setOpen(true)} 
            className="flex items-center gap-2"
            disabled={provinces.length === 0}
          >
            <PlusCircle className="h-4 w-4" />
            Add City
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>
              Add a new city and link it to a province.
            </DialogDescription>
          </DialogHeader>
          
          <CityForm
            provinces={provinces}
            onSubmit={onAddCity}
            onCancel={() => dialogs.cities.add.setOpen(false)}
            isSubmitting={dialogs.cities.add.isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Province Dialog */}
      <Dialog 
        open={dialogs.provinces.edit.isOpen} 
        onOpenChange={dialogs.provinces.edit.setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Province</DialogTitle>
            <DialogDescription>
              Update province details.
            </DialogDescription>
          </DialogHeader>
          
          {dialogs.provinces.edit.selected && (
            <ProvinceForm
              initialData={dialogs.provinces.edit.selected}
              onSubmit={onUpdateProvince}
              onCancel={() => dialogs.provinces.edit.setOpen(false)}
              isSubmitting={dialogs.provinces.edit.isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit City Dialog */}
      <Dialog 
        open={dialogs.cities.edit.isOpen} 
        onOpenChange={dialogs.cities.edit.setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>
              Update city details.
            </DialogDescription>
          </DialogHeader>
          
          {dialogs.cities.edit.selected && (
            <CityForm
              provinces={provinces}
              initialData={dialogs.cities.edit.selected}
              onSubmit={onUpdateCity}
              onCancel={() => dialogs.cities.edit.setOpen(false)}
              isSubmitting={dialogs.cities.edit.isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 