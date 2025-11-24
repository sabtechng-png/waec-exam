import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, IconButton, Chip, Tooltip, Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ImageIcon from "@mui/icons-material/Image";

export default function QuestionsTable({
  questions,
  truncated,
  selected,
  selectAll,
  onToggleSelectAll,
  onToggleOne,
  onEdit,
  onDelete,
  onDuplicate,
}) {
  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectAll}
              indeterminate={
                selected.length > 0 && selected.length < questions.length
              }
              onChange={(e) => onToggleSelectAll(e.target.checked)}
            />
          </TableCell>

          <TableCell>ID</TableCell>
          <TableCell>Question</TableCell>
          <TableCell>Options</TableCell>
          <TableCell>Correct</TableCell>
          <TableCell>Difficulty</TableCell>
          <TableCell>Image</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {questions.map((q) => (
          <TableRow key={q.id}>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selected.includes(q.id)}
                onChange={(e) => onToggleOne(q.id, e.target.checked)}
              />
            </TableCell>

            <TableCell>{q.id}</TableCell>
            <TableCell>{truncated(q.question, 100)}</TableCell>

            <TableCell>
              <Typography variant="caption">
                <b>A:</b> {truncated(q.option_a, 20)}{" "}
                <b>B:</b> {truncated(q.option_b, 20)}{" "}
                <b>C:</b> {truncated(q.option_c, 20)}{" "}
                <b>D:</b> {truncated(q.option_d, 20)}
              </Typography>
            </TableCell>

            <TableCell>
              <Chip label={q.correct_option} color="primary" size="small" />
            </TableCell>

            <TableCell>
              <Chip label={q.difficulty} size="small" variant="outlined" />
            </TableCell>

            <TableCell>
              {q.stem_image_url ? (
                <Tooltip title="View image">
                  <a href={q.stem_image_url} target="_blank" rel="noreferrer">
                    <ImageIcon fontSize="small" />
                  </a>
                </Tooltip>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  None
                </Typography>
              )}
            </TableCell>

            <TableCell align="right">
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(q)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Duplicate">
                <IconButton size="small" onClick={() => onDuplicate(q)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => onDelete(q)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
