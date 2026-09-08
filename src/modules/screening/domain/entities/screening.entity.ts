export class ScreeningEntity {
	public constructor(
		public readonly id: string,
		public readonly hallId: string,
		public readonly movieId: string,
		public readonly startAt: Date,
		public readonly endAt: Date,
	) {}
}
