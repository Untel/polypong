/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tokenPayload.interface.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:51 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:53 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

interface TokenPayload {
  id: number;
  is2fa?: boolean;
}

export default TokenPayload;
