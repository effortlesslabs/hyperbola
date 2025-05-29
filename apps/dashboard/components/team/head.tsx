import { Button } from "../ui/button";

export function Head() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Team</h1>
      <Button>Invite</Button>
    </div>
  );
}
