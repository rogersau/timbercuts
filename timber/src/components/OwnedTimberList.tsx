// React import not required; using JSX runtime
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { type OwnedTimber } from "@/lib/timber-optimizer";
import { mmToDisplayNumber, displayToMM } from "@/lib/units";

type Props = {
  ownedTimbers: OwnedTimber[];
  unit: "mm" | "in";
  addOwnedTimber: () => void;
  removeOwnedTimber: (idx: number) => void;
  updateOwnedTimber: (
    idx: number,
    field: keyof OwnedTimber,
    value: number
  ) => void;
};

export function OwnedTimberList({
  ownedTimbers,
  unit,
  addOwnedTimber,
  removeOwnedTimber,
  updateOwnedTimber,
}: Props) {
  return (
    <div>
      {ownedTimbers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No owned material. Click below to add.
        </p>
      ) : (
        ownedTimbers.map((owned, index) => (
          <div key={index} className="flex gap-2 items-center py-1">
            <div className="flex-1">
              <InputGroup>
                <InputGroupInput
                  placeholder={`Length (${unit})`}
                  value={
                    owned.length ? mmToDisplayNumber(owned.length, unit) : ""
                  }
                  onChange={(e) =>
                    updateOwnedTimber(
                      index,
                      "length",
                      displayToMM(Number(e.target.value), unit)
                    )
                  }
                  type="number"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{unit}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="w-24">
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>x</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Qty"
                  value={owned.quantity || ""}
                  onChange={(e) =>
                    updateOwnedTimber(index, "quantity", Number(e.target.value))
                  }
                  type="number"
                />
              </InputGroup>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => removeOwnedTimber(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      <div className="mt-2">
        <Button onClick={addOwnedTimber} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Owned Timber</span>
        </Button>
      </div>
    </div>
  );
}

export default OwnedTimberList;
