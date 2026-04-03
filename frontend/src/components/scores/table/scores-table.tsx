"use client";

import { useScoresQuery, useDeleteScore } from "@/hooks/scores/use-scores-query";
import { Loader2 } from "lucide-react";
import { ScoreResponse } from "@/types/scores";
import { ScoringType } from "@/types/enums";
import { useTableFilter, useTableSort, useTablePagination, compareTableItemValues } from "@/hooks/shared";
import { TableContainer, TablePagination } from "@/components/shared/table";
import { ScoreCard } from "../cards/score-card";
import { useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ScoreViewDialog } from "../dialogs/score-view-dialog";
import { ScoreDialog } from "../dialogs/score-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";

export interface ScoresTableProps {
  searchQuery: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function ScoresTable({ searchQuery, sortKey, sortDirection }: Readonly<ScoresTableProps>) {
  const { projectId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/scores", strict: false });

  const { data: allScores = [], isLoading, error } = useScoresQuery(projectId);

  const deleteMutation = useDeleteScore(projectId);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [scoreToDelete, setScoreToDelete] = useState<Score | null>(null);


  const nonRagasScores = allScores.filter((score) => score.scoringType !== 'RAGAS');


  const filteredScores = useTableFilter(nonRagasScores, searchQuery, {
    searchFields: ['name', 'description', 'scoringType']
  });


  const { sortedItems: sortedScores } = useTableSort(filteredScores, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });
  const scoresToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedScores;
    const sorted = [...filteredScores];
    const sortBy = sortKey as keyof ScoreResponse;
    sorted.sort((a, b) =>
    compareTableItemValues(a[sortBy], b[sortBy], sortBy, sortDirection)
    );
    return sorted;
  }, [filteredScores, sortedScores, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    scoresToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleEdit = (score: ScoreResponse) => {

    if (score.scoringType === ScoringType.RAGAS) {
      return;
    }
    setSelectedScore(score);
    setEditDialogOpen(true);
  };

  const handleView = (scoreId: string) => {
    setSelectedScoreId(scoreId);
    setViewDialogOpen(true);
  };

  const handleDelete = (score: Score) => {
    setScoreToDelete(score);
    setDeleteDialogOpen(true);
  };

  const handleDialogSuccess = () => {

  };

  const handleConfirmDelete = async () => {
    if (scoreToDelete) {
      try {
        await deleteMutation.mutateAsync(scoreToDelete.id);
        setDeleteDialogOpen(false);
        setScoreToDelete(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <TableContainer
        isLoading={isLoading}
        error={error}
        isEmpty={filteredScores.length === 0}
        emptyMessage="No scores found">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((score: ScoreResponse) =>
          <ScoreCard
            key={score.id}
            score={score}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            projectId={projectId} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <ScoreViewDialog
        scoreId={selectedScoreId}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        projectId={projectId}
        onEdit={(score) => {
          setViewDialogOpen(false);
          setSelectedScore(score);
          setEditDialogOpen(true);
        }}
        onDelete={handleDialogSuccess} />


      <ScoreDialog
        score={selectedScore}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedScore(null);
          }
        }}
        projectId={projectId}
        onSuccess={handleDialogSuccess} />


      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the score "{scoreToDelete?.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700">

              {deleteMutation.isPending ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </> :

              'Delete'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);

}