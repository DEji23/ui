"use client"

import {
  IconBan,
  IconEye,
  IconFlag,
  IconRefresh,
} from "@tabler/icons-react"

import { Button } from "@/registry/new-york-v4/ui/button"
import { Progress } from "@/registry/new-york-v4/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/new-york-v4/ui/tooltip"

import { devices } from "../data"
import { StatusBadge } from "./status-badge"

function scoreColor(score: number) {
  if (score >= 70) return "[&>div]:bg-destructive"
  if (score >= 35) return "[&>div]:bg-amber-500"
  return "[&>div]:bg-emerald-500"
}

export function ValidationTab() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Device ID</TableHead>
            <TableHead>Bus</TableHead>
            <TableHead>Operator</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last sync</TableHead>
            <TableHead className="text-right">Validation attempts</TableHead>
            <TableHead className="text-right">Failed</TableHead>
            <TableHead className="text-right">Duplicate scans</TableHead>
            <TableHead className="w-40">Suspicious activity score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.deviceId}>
              <TableCell className="font-mono text-xs">{device.deviceId}</TableCell>
              <TableCell>{device.bus}</TableCell>
              <TableCell>{device.operator}</TableCell>
              <TableCell>
                <StatusBadge status={device.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{device.lastSync}</TableCell>
              <TableCell className="text-right tabular-nums">{device.validationAttempts}</TableCell>
              <TableCell className="text-right tabular-nums">{device.failedValidations}</TableCell>
              <TableCell className="text-right tabular-nums">{device.duplicateScans}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={device.suspicionScore} className={scoreColor(device.suspicionScore)} />
                  <span className="w-8 text-xs tabular-nums text-muted-foreground">
                    {device.suspicionScore}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <IconFlag className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Flag device</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <IconBan className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Disable device</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <IconRefresh className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Force re-sync</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <IconEye className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View raw validation logs</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
