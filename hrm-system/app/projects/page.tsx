"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/lib/components/ProjectCard";
import Button from "@/lib/components/Button";
import { EmployeeProjects } from "../types/employee-projects";
import { Project } from "@/models";

interface ApiResponse<T> {
  success: boolean;
  data?: T[];
  count?: number;
  total?: number;
  error?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [myProjects, setMyProjects] = useState<EmployeeProjects[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loadingMy, setLoadingMy] = useState<boolean>(true);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function fetchMyProjects() {
      try {
        setLoadingMy(true);
        setError(null);

        const response = await fetch("/api/projects/my");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<EmployeeProjects> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch my projects");
        }

        setMyProjects(data.data || []);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch my projects";
        setError(errorMessage);
        console.error("Error fetching my projects:", err);
      } finally {
        setLoadingMy(false);
      }
    }

    fetchMyProjects();
  }, []);

  useEffect(() => {
    async function fetchAllProjects() {
      try {
        setLoadingAll(true);
        setError(null);

        const response = await fetch(
          `/api/projects?page=${currentPage}&limit=${itemsPerPage}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<Project> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch projects");
        }

        setAllProjects(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch projects";
        setError(errorMessage);
        console.error("Error fetching projects:", err);
      } finally {
        setLoadingAll(false);
      }
    }

    fetchAllProjects();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(-2);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => router.push("/manager/projects/new")}>
          New Project
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error: {error}</p>
        </div>
      )}

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">My Projects</h2>
        {loadingMy ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : myProjects.length === 0 ? (
          <p className="text-gray-600">No projects assigned to you.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showEmployeeInfo={true}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">All Projects</h2>
        {loadingAll ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : allProjects.length === 0 ? (
          <p className="text-gray-600">No projects found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showEmployeeInfo={false}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-2"
              >
                &lt;
              </Button>
              {getPageNumbers().map((page, index) =>
                page < 0 ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    onClick={() => handlePageClick(page)}
                    className="px-3 py-2 min-w-10"
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2"
              >
                &gt;
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
