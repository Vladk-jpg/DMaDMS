"use client";

import { EmployeeProjects } from "@/app/types/employee-projects";
import { Project } from "@/models";
import Dropdown, { DropdownItem } from "./Dropdown";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectCardProps {
  project: EmployeeProjects | Project;
  showEmployeeInfo?: boolean;
  onProjectEnd?: () => void;
}

function isEmployeeProject(
  project: EmployeeProjects | Project
): project is EmployeeProjects {
  return "role" in project && "assigned_date" in project;
}

export default function ProjectCard({
  project,
  showEmployeeInfo = false,
  onProjectEnd,
}: ProjectCardProps) {
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);
  const startDate = new Date(project.start_date);
  const endDate = project.end_date ? new Date(project.end_date) : null;
  const employeeProject = isEmployeeProject(project) ? project : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = () => {
    if (!endDate) {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    }
    return null;
  };

  const isInProgress = !endDate;

  const handleEndProject = async () => {
    if (isEnding) return;

    setIsEnding(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to end project");
      }

      if (onProjectEnd) {
        onProjectEnd();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error ending project:", error);
      alert("Failed to end project");
    } finally {
      setIsEnding(false);
    }
  };

  const handleOpenProject = () => {
    router.push(`/manager/projects/${project.id}`);
  };

  const handleEditProject = () => {
    router.push(`/manager/projects/${project.id}/edit`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isInProgress
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {isInProgress ? "In progress" : "Completed"}
        </span>
        <Dropdown
          trigger={
            <button className="text-gray-400 hover:text-gray-600">
              <span className="text-xl">⋯</span>
            </button>
          }
        >
          <DropdownItem onClick={handleOpenProject}>Open</DropdownItem>
          <DropdownItem onClick={handleEditProject}>Edit</DropdownItem>
          {isInProgress && (
            <DropdownItem
              onClick={handleEndProject}
              className={isEnding ? "opacity-50" : ""}
            >
              {isEnding ? "Ending..." : "End"}
            </DropdownItem>
          )}
        </Dropdown>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      <div className="space-y-3 mb-4">
        {showEmployeeInfo && employeeProject && (
          <>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Role
              </p>
              <p className="text-sm font-medium text-gray-900">
                {employeeProject.role}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Since
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(new Date(employeeProject.assigned_date))}
              </p>
            </div>
          </>
        )}

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Start Date
          </p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(startDate)}
          </p>
        </div>

        {isInProgress && calculateDuration() && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Duration
            </p>
            <p className="text-sm font-medium text-gray-900">
              {calculateDuration()}
            </p>
          </div>
        )}

        {!isInProgress && endDate && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              End Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(endDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
